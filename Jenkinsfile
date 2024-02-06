pipeline {
    agent any
    tools {
        nodejs 'nodejs'
    }

    environment {
        HEROKU_APP_NAME = 'jenkins-front-end' // Your Heroku app name
        DEPLOY_BRANCH = 'main' // The branch from which deployments are allowed
        DEPLOYMENT_DIR = 'deployment' // Directory path for Heroku deployment
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Prepare Deployment Directory') {
            steps {
                // Ensure the deployment directory is clean and ready
                sh "rm -rf ${DEPLOYMENT_DIR}"
                sh "mkdir -p ${DEPLOYMENT_DIR}"
                // Use credentials to clone the Heroku app's Git repository into the deployment directory
                withCredentials([usernamePassword(credentialsId: 'gitauth', passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USERNAME')]) {
                    sh "git clone https://${GIT_USERNAME}:${GIT_PASSWORD}@git.heroku.com/${HEROKU_APP_NAME}.git ${DEPLOYMENT_DIR}"
                }
            }
        }

        stage('Build') {
            steps {
                dir('webui') {
                    echo 'Building Frontend...'
                    sh 'npm ci' // Use npm ci for a cleaner, more reliable install based on package-lock.json
                    sh 'CI=false npm run build' // Build the project
                    // Copy build artifacts to the deployment directory
                    sh "cp -R build/* ../${DEPLOYMENT_DIR}"
                }
            }
        }

        stage('Deploy') {
            when {
                branch DEPLOY_BRANCH
            }
            steps {
                dir("${DEPLOYMENT_DIR}") {
                    echo 'Deploying to Heroku...'
                    // Use credentials to configure Git user and push changes
                    withCredentials([usernamePassword(credentialsId: 'gitauth', passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USERNAME')]) {
                        sh """
                            git config user.name "${GIT_USERNAME}"
                            git config user.email "${GIT_USERNAME}@users.noreply.heroku.com"
                            git add .
                            git commit -m "Deployed by Jenkins"
                            git push https://${GIT_USERNAME}:${GIT_PASSWORD}@git.heroku.com/${HEROKU_APP_NAME}.git master --force
                        """
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment has been successful!'
        }
        failure {
            echo 'Build or Deployment has failed.'
        }
    }
}
