pipeline {
    agent any

    tools {
        nodejs 'nodejs'
    }

    environment {
        // Assuming these are correctly set in your Jenkins credentials and environment
        HEROKU_API_KEY = credentials('HEROKU_API_KEY')
        HEROKU_APP_NAME = 'jenkins-front-end' // Your Heroku app name
        DEPLOY_BRANCH = 'main' // Adjusted to 'main' as it seems to be the branch you're using
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            // This stage will now proceed if the branch is 'main'
         steps {
                dir('webui') {
                    echo 'Building Frontend...'
                    sh 'dir'
                    sh 'ls'
                    sh 'npm install'
                    sh 'npm start'
                    // Ensure the build artifacts are in the right location for deployment
                }
            }
        }

        stage('Deploy') {
            // This stage will now proceed if the branch is 'main'
            when {
                branch DEPLOY_BRANCH
            }
            steps {
                dir('webui') {
                    echo 'Deploying to Heroku...'
                    sh 'git init'
                    sh 'heroku git:remote -a $HEROKU_APP_NAME'
                    sh 'git add .'
                    sh 'git commit -m "Deploy to Heroku"'
                    // Force push to Heroku might be necessary if previous deployments have been made
                    sh 'git push heroku HEAD:master --force'
                }
            }
        }
    }

    post {
        success {
            // Only echo success if the deploy stage was executed
            script {
                if (env.BRANCH_NAME == DEPLOY_BRANCH) {
                    echo 'Deployment has been successful!'
                } else {
                    echo 'Build successful, but deployment was skipped due to branch conditions.'
                }
            }
        }
        failure {
            echo 'Build or Deployment has failed.'
        }
    }
}
