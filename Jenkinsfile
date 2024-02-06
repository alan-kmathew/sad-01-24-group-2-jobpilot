pipeline {
    agent any

    environment {
        HEROKU_API_KEY = credentials('HEROKU_API_KEY')
        HEROKU_APP_NAME = 'jenkins-front-end' // Replace with your actual Heroku app name
        DEPLOY_BRANCH = 'jenkins-deploy' // The branch from which deployments are allowed
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            when {
                branch DEPLOY_BRANCH
            }
            steps {
                dir('webui') { // Change 'webui' to the path of your frontend subfolder if different
                    echo 'Building Frontend'
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('Deploy') {
            when {
                branch DEPLOY_BRANCH
            }
            steps {
                dir('webui') { // Change 'webui' to the path of your frontend subfolder if different
                    echo 'Deploying to Heroku'
                    sh 'git init'
                    sh 'heroku git:remote -a $HEROKU_APP_NAME'
                    // Temporarily move content to root for deployment
                    sh 'mkdir tmp-deploy && mv * tmp-deploy'
                    sh 'mv tmp-deploy/* .'
                    sh 'git add .'
                    sh 'git commit -m "Deploying to Heroku"'
                    sh 'git push heroku HEAD:master --force'
                    // Clean up
                    sh 'rm -r * && mv tmp-deploy/* . && rm -r tmp-deploy'
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment has been successful!'
        }
        failure {
            echo 'Deployment has failed.'
        }
    }
}
