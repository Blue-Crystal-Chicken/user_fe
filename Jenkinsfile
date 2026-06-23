// test build trigger via git push
pipeline {
    agent any

    options {
        timeout(time: 1, unit: 'HOURS')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    stages {
        stage('Inizializzazione') {
            steps {
                echo '=== Inizializzazione della Pipeline User Frontend ==='
                sh 'docker version'
            }
        }

       stage('Installazione Dipendenze') {
            steps {
                echo '=== Installazione dipendenze Frontend (Expo/React Native) ==='
                sh "docker run --rm -v bcc_jenkins_data:/var/jenkins_home -w \"${WORKSPACE}\" node:22-alpine sh -c 'corepack enable && pnpm install --frozen-lockfile'"
            }
        }
    }

    post {
        success { echo '=== User FE: pipeline completata con successo! ===' }
        failure { echo '=== User FE: errore durante la pipeline ===' }
    }
}
