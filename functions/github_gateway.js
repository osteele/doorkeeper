// "apollo-client-preset": "^1.0.5",
//     "apollo-link-context": "^1.0.3",
//     "graphql": "^0.11.0",

const { ApolloClient } = require('apollo-client');
const { InMemoryCache } = require('apollo-cache-inmemory');
const { createHttpLink } = require('apollo-link-http');
const { setContext } = require('apollo-link-context');
const gql = require('graphql-tag');

exports.getGithubInfo = functions.https.onRequest(async (req, res) => {
    try {
        // const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
        // const user = await getUser(req.headers.authorization);
        // console.info('user', user)
        // res.send({ user });
        // TODO retrieve from firebase:
        const accessToken = '286e70455242fe5332bbeb25ef9f3331cfc05c8f';
        const authLink = setContext((_, { headers }) => {
            //     const token = GITHUB_TOKEN;
            const token = accessToken;
            return {
                headers: {
                    ...headers,
                    authorization: token ? `Bearer ${token}` : null,
                }
            };
        });
        const githubClient = new ApolloClient({
            link: authLink.concat(createHttpLink({ uri: 'https://api.github.com/graphql', fetch: fetch })),
            cache: new InMemoryCache(),
        });
        const email = 'steele@osteele.com'
        const ghUser = await githubClient.query({ query: USER_QUERY, variables: { email }, }).then(({ data }) => data);
        console.info('ghUser', ghUser)
        // find firebase.identities['github.com']
    } catch (err) {
        res.status(400).send({ error: { message: err.message } });
    }
});

const USER_QUERY = gql`
query ($email: String!) {
    user(email: $email) {
        email
        isViewer
        login
        name
        organizations(first:30) {
            totalCount
            nodes {
                login
            }
        }
    }
}
`;
