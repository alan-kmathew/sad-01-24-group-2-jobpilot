pipeline {
    agent any

    environment {
        // Load credentials from Jenkins Credential Store
        withCredentials([string(credentialsId: 'HEROKU_API_KEY', variable: 'HEROKU_API_KEY'),
                         string(credentialsId: 'HEROKU_APP_NAME', variable: 'HEROKU_APP_NAME')]) {

            // Store DEPLOY_BRANCH as an environment variable (optional)
           def DEPLOY_BRANCH = 'jenkins-deploy' // (if not stored as a credential)
        }
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: "${DEPLOY_BRANCH}",
                    credentialsId: 'auth0000',
                    url: 'https://github.com/alan-kmathew/sad-01-24-group-2-jobpilot.git'
            }
        }

        stage('Pull Latest Changes from main') {
            steps {
                sh 'git pull origin main'
            }
        }

        stage('Build Application') {
            // Replace with your build commands specific to your project
            steps {
                // Example for Node.js application
                sh 'npm install'
                sh 'npm run build'
            }
        }

        stage('Deploy to Heroku') {
            steps {
                sh '''
                    # Set Heroku CLI context using API key and app name
                    heroku auth:token ${HEROKU_API_KEY}
                    heroku git:remote -a ${HEROKU_APP_NAME}

                    # Push current working directory (where build artifacts are) to Heroku
                    git push heroku HEAD:master
                '''
            }
        }
    }

    post {
        always {
            cleanWs() // Clean up workspace after each build
        }
    }
}
