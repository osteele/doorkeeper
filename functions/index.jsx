const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

admin.initializeApp(functions.config().firebase);

const authenticate = (req, res, next) => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        res.status(403).send('Unauthorized');
        return;
    }
    const idToken = req.headers.authorization.split('Bearer ')[1];
    admin.auth().verifyIdToken(idToken).then(decodedIdToken => {
        req.user = decodedIdToken;
        next();
    }).catch(error => {
        res.status(403).send('Unauthorized');
    });
};

getGithubLogin = async (accessToken) => {
    const response = await fetch('https://api.github.com/user', {
        headers: {
            Authorization: `token ${accessToken}`,
            Accept: 'application/vnd.github.v3+json'
        }
    });
    const { login } = await response.json()
    return login
}

const getUser = async (auth) => {
    if (auth && auth.startsWith('Bearer ')) {
        const idToken = auth.split('Bearer ')[1];
        return await admin.auth().verifyIdToken(idToken);
    }
}

const userInCourse = async (user, courseName) => {
    const githubLogin = await admin.firestore().collection('users').doc(user.uid).get()
        .then(doc => doc.data().github.login);
    const roster = await admin.firestore().collection('rosters').doc(courseName).get()
        .then(doc => doc.data());
    console.info(roster, githubLogin)
    return !!roster.github_logins[githubLogin];
}

exports.register = functions.https.onRequest(async (req, res) => {
    const user = await getUser(req.headers.authorization);
    console.info('register', user, req.body);
    const { accessToken } = req.body;
    const login = await getGithubLogin(accessToken);
    const timestamp = new Date();
    console.info('set', user.uid, { github: { accessToken, login }, timestamp })
    await admin.firestore().collection('users').doc(user.uid).set({ github: { accessToken, login }, timestamp });
    res.end();
});

exports.permissions = functions.https.onRequest(async (req, res) => {
    try {
        const { domain } = req.query;
        const course = await admin.firestore().collection('sites').doc(domain).get()
            .then(doc => doc.data().course);
        const user = await getUser(req.headers.authorization);
        const read = await userInCourse(user, course);
        res.send({ domain, course, permissions: { read }, version: '1.2', user: { name: user.name, email: user.email } });
    } catch (err) {
        res.status(400).send({ error: { message: err.message } });
    }
});
