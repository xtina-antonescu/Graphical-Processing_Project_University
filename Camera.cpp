#include "Camera.hpp"

namespace gps {

    //Camera constructor
    Camera::Camera(glm::vec3 cameraPosition, glm::vec3 cameraTarget, glm::vec3 cameraUp) {

        this->cameraPosition = cameraPosition;
        this->cameraTarget = cameraTarget;
        this->cameraUpDirection = cameraUp;
        this->cameraFrontDirection = glm::normalize(cameraPosition - cameraTarget);
        this->cameraRightDirection = glm::normalize(glm::cross(this->cameraUpDirection, this->cameraFrontDirection));
    }

    //return the view matrix, using the glm::lookAt() function
    glm::mat4 Camera::getViewMatrix() {

        return glm::lookAt(this->cameraPosition, this->cameraTarget, this->cameraUpDirection);
    }

    //update the camera internal parameters following a camera move event
    void Camera::move(MOVE_DIRECTION direction, float speed) {

        switch (direction) {
        case MOVE_FORWARD:
            this->cameraPosition += this->cameraFrontDirection * speed;
            break;
        case MOVE_BACKWARD:
            this->cameraPosition -= this->cameraFrontDirection * speed;
            break;
        case MOVE_LEFT:
            this->cameraPosition -= this->cameraRightDirection * speed;
            break;
        case MOVE_RIGHT:
            this->cameraPosition += this->cameraRightDirection * speed;
            break;
        }

        //cameraFrontDirection = glm::normalize(cameraPosition - cameraTarget);
        this->cameraTarget = this->cameraFrontDirection + this->cameraPosition;
        this->cameraRightDirection = glm::normalize(glm::cross(this->cameraUpDirection, this->cameraFrontDirection));
    }

    float Camera::returnZ() {
        return this->cameraPosition.z;
    }

    glm::vec3 Camera::getCameraTarget() {
        return this->cameraTarget;
    }
    void Camera::setCameraTarget(glm::vec3 modifiedCameraTarget) {
        this->cameraTarget = modifiedCameraTarget;
    }
    //update the camera internal parameters following a camera rotate event
    //yaw - camera rotation around the y axis
    //pitch - camera rotation around the x axis
    void Camera::rotate(float pitch, float yaw) {

        glm::vec3 direction;
        direction.x = cos(glm::radians(yaw)) * cos(glm::radians(pitch));
        direction.y = sin(glm::radians(pitch));
        direction.z = sin(glm::radians(yaw)) * cos(glm::radians(pitch));

        this->cameraFrontDirection = glm::normalize(direction);
        this->cameraTarget = this->cameraFrontDirection + this->cameraPosition;
        this->cameraRightDirection = glm::normalize(glm::cross(this->cameraUpDirection, this->cameraFrontDirection));
    }

    void Camera::animate(float angle) {
        this->cameraPosition = glm::vec3(-0.112099f, 12.204f, -13.3325f);
        this->cameraTarget = glm::vec3(-0.413463f, 4.62152, 6.9432f);

        glm::mat4 transformationMatrix;
        transformationMatrix = glm::mat4(1.0f);

        transformationMatrix = glm::translate(transformationMatrix, glm::vec3(0.0f, 0.0f, -0.1f));
        transformationMatrix = glm::rotate(transformationMatrix, glm::radians(angle), glm::vec3(0.0f, 1.0f, 0.0f));

        this->cameraPosition = glm::vec4(transformationMatrix * glm::vec4(this->cameraPosition, 1.0f));
        this->cameraFrontDirection = glm::normalize(cameraPosition - cameraTarget);
        this->cameraRightDirection = glm::normalize(glm::cross(this->cameraFrontDirection, glm::vec3(0.0f, 1.0f, 0.0f)));


    }
  
}