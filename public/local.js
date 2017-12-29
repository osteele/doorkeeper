function signIn() {
    const provider = new firebase.auth.GithubAuthProvider();
    // provider.setCustomParameters({ 'redirect_uri': 'false' });
    provider.addScope('read:org');
    firebase.auth().signInWithRedirect(provider);
}

function signOut() {
    firebase.auth().signOut().catch(function (error) {
        console.error(error.message)
    });
}

firebase.auth().onAuthStateChanged(user => {
    if (user) {
        document.getElementById('load').innerHTML = "Signed in";
    } else {
        document.getElementById('load').innerHTML = "Signed out";
        // signIn();
    }
});

firebase.auth().getRedirectResult().then(result => {
    if (result && result.additionalUserInfo) {
        firebase.auth().currentUser.getIdToken(true).then((idToken) => {
            $.ajax({
                type: 'post',
                url: '/api/register',
                beforeSend: xhr => xhr.setRequestHeader("Authorization", `Bearer ${idToken}`)
            });
        });
    }
}).catch((error) => {
    console.info(error)
    console.error(error.message);
});

document.addEventListener('DOMContentLoaded', () => {
    if (window.localStorage.testDomain) {
        document.getElementById('domain').value = window.localStorage.testDomain;
    }
})

function testPermissions() {
    const domain = document.getElementById('domain').value;
    document.getElementById('status').innerHTML = "Waiting…";
    window.localStorage.testDomain = domain;
    firebase.auth().currentUser.getIdToken(true).then((idToken) => {
        $.ajax({
            url: '/api/permissions',
            data: { domain },
            beforeSend: xhr => xhr.setRequestHeader("Authorization", `Bearer ${idToken}`),
            success: data => {
                // console.info(data)
                const { user } = data;
                const fields = [
                    'domain: ' + data.domain,
                    'course: ' + data.course,
                    'permissions: ' + JSON.stringify(data.permissions),
                    'username: ' + user.name,
                    'email: ' + user.email
                ];
                document.getElementById('status').innerHTML = fields.join('<br/>');
            },
            error: (xhr, textStatus, errorThrown) => {
                if (xhr.responseJSON && xhr.responseJSON.error && xhr.responseJSON.error.message) {
                    return alert(xhr.responseJSON.error.message);
                }
                alert(textStatus);
                console.error(xhr, textStatus, errorThrown);
            }
        });
    })
}
