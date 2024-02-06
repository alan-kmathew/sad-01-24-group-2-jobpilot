pipeline {
    agent any
    tools {
        nodejs 'nodejs'
    }

    environment {
        // Use a long-lived Heroku authorization token for seamless authentication
        HEROKU_API_KEY = credentials('HEROKU_API_KEY')
        HEROKU_APP_NAME = 'jenkins-front-end'
        DEPLOY_BRANCH = 'main'
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
                    sh 'npm ci'
                    sh 'CI=false npm run build'
                }
            }
        }

        stage('Deploy') {
            steps {
                dir('webui/build') {
                    echo 'Deploying to Heroku...'
                    sh '''
                        heroku --version
                        # Check for existing Git remote (optional)
                        git remote -v | grep heroku || heroku git:remote -a $HEROKU_APP_NAME
                        git push heroku HEAD:main -f
                    '''
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
