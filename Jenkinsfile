pipeline {
    agent any
    tools {
        nodejs 'nodejs'
    }
    environment {
        // These should be set in your Jenkins credentials and environment variables
        HEROKU_API_KEY = credentials('HEROKU_API_KEY')
        HEROKU_APP_NAME = 'jenkins-front-end' // Your Heroku app name
        DEPLOY_BRANCH = 'main' // The branch from which deployments are allowed
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                dir('webui') {
                    echo 'Building Frontend...'
                    sh 'dir'
                    sh 'npm ci' // Use npm ci for a cleaner, more reliable install based on package-lock.json
                    sh 'CI=false npm run build' // Build the project
                }
            }
        }

        stage('Deploy') {
            steps {
                dir('webui/build') { // Assuming build artifacts are located in the 'build' directory within 'webui'
                    echo 'Deploying to Heroku...'
                    sh """
                        curl https://cli-assets.heroku.com/install.sh | sh
                        heroku container:login
                        heroku container:push web -a $HEROKU_APP_NAME
                        heroku container:release web -a $HEROKU_APP_NAME
                    """
                }
            }
        }
    }

    post {
        success {
            script {
                if (env.BRANCH_NAME == DEPLOY_BRANCH) {
                    echo 'Deployment has been successful!'
                } else {
                    echo 'Build successful, deployment skipped due to branch conditions.'
                }
            }
        }
        failure {
            echo 'Build or Deployment has failed.'
        }
    }
}
