# Website Doorkeeper

The doorkeeper redirects students away from course pages they're not supposed to
see.

It's intended for use with Google Sites, and static sites posted on GitHub
Pages, Netlify, and other stacking hosting servers.

It allows us to keep old course sites available to the students who enrolled
in the respective offering, while reducing the chance that a current student
will stumble across them, and making it marginally more difficult for someone
to see material from a course they're not enrolled in.

This doesn't secure a website. A determined student can still hack their way
into a site that the doorkeeper prevents.

## Install

`yarn install`

## Develop

`yarn serve`

Visit <http://localhost:5000>. Use this to sign in and out of GitHub, and
see whether you'd be able to see a website under different conditions.

### Debug Cloud Functions

```bash
cd functions
yarn shell
```

## Deploy

`yarn deploy`

## Usage

Add this to site pages:

    <script src="olin-website-gatekeeper.firebase"></script>
