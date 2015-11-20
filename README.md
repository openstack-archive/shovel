# Shovel-horizon
In swagger-tools\middleware\swagger-ui
Set Validator to null

window.swaggerUi = new SwaggerUi({
          url: url,
          validatorUrl: null,
          dom_id: "swagger-ui-container",
          supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
          onComplete: function(swaggerApi, swaggerUi){
            if(typeof initOAuth == "function") {
              /*
              initOAuth({
                clientId: "your-client-id",
                realm: "your-realms",
                appName: "your-app-name"
              });
