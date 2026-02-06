pipeline {
  agent any

  environment {
    REGISTRY   = "localhost:5000"
    APP_NAME   = "saratube"
    NAMESPACE  = "apps"
    IMAGE_TAG  = "latest"
    IMAGE      = "${REGISTRY}/${APP_NAME}:${IMAGE_TAG}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build Docker Image') {
      steps {
        sh """
          docker build -t ${IMAGE} .
        """
      }
    }

    stage('Push to Local Registry') {
      steps {
        sh """
          docker push ${IMAGE}
        """
      }
    }

    stage('Deploy to k3s') {
      steps {
        sh """
          # ensure namespace exists
          kubectl get ns ${NAMESPACE} >/dev/null 2>&1 || kubectl create ns ${NAMESPACE}

          # if deployment already exists, just restart so it pulls latest
          if kubectl -n ${NAMESPACE} get deploy ${APP_NAME} >/dev/null 2>&1; then
            kubectl -n ${NAMESPACE} rollout restart deploy/${APP_NAME}
          else
            echo "Deployment ${APP_NAME} does not exist yet. Apply k8s manifests first."
            exit 1
          fi

          kubectl -n ${NAMESPACE} rollout status deploy/${APP_NAME} --timeout=180s
        """
      }
    }
  }
}
