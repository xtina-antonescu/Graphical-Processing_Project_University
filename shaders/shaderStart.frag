#version 410 core

in vec3 fNormal;
in vec4 fPosEye;
in vec2 fTexCoords;
in vec4 fragPosLightSpace;

out vec4 fColor;

uniform int fogOk;

//point lights
uniform vec3 lightPosEye;
uniform vec3 lightColorPoint;
uniform int lightPointOk;

//lighting
uniform	vec3 lightDir;
uniform	vec3 lightColor;

//texture
uniform sampler2D diffuseTexture;
uniform sampler2D specularTexture;
uniform sampler2D shadowMap;


vec3 ambient;
float ambientStrength = 0.2f;
vec3 diffuse;
vec3 specular;
float shadow;
float specularStrength = 0.5f;
float shininess = 32.0f;

float constant = 1.0f; 
float linear = 0.0045f; 
float quadratic = 0.0075f;

vec3 ambientPoint;
vec3 diffusePoint;
vec3 specularPoint;

float computeFog()
{
	float fogDensity = 0.008f;
	float fragmentDistance = length(fPosEye);
	float fogFactor = exp(-pow(fragmentDistance*fogDensity, 2));
	
	return clamp(fogFactor, 0.0f, 1.0f);
}

float computeShadow() 
{
	vec3 normalizedCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
	normalizedCoords = normalizedCoords * 0.5 + 0.5;
	
	if (normalizedCoords.z > 1.0f)
		return 0.0f;
	
	float closestDepth = texture(shadowMap, normalizedCoords.xy).r;
	float currentDepth = normalizedCoords.z;
	
	float bias = max(0.05f * (1.0f - dot(normalize(fNormal), lightDir)), 0.005f);
	float shadow = currentDepth - bias > closestDepth ? 1.0f : 0.0f;

	//float shadow = currentDepth > closestDepth ? 1.0 : 0.0;

	return shadow;
}

void computeLightComponents()
{		
	vec3 cameraPosEye = vec3(0.0f);//in eye coordinates, the viewer is situated at the origin
	
	//transform normal
	vec3 normalEye = normalize(fNormal);	
	
	//compute light direction
	vec3 lightDirN = normalize(lightDir);
	
	//compute view direction 
	vec3 viewDirN = normalize(cameraPosEye - fPosEye.xyz);
		
	//compute ambient light
	ambient = ambientStrength * lightColor;
	
	//compute diffuse light
	diffuse = max(dot(normalEye, lightDirN), 0.0f) * lightColor;
	
	//compute specular light
	vec3 reflection = reflect(-lightDirN, normalEye);
	float specCoeff = pow(max(dot(viewDirN, reflection), 0.0f), shininess);
	specular = specularStrength * specCoeff * lightColor;
}

void computePointLights(){
	
	vec3 cameraPosEye = vec3(0.0f);
	
	vec3 normalEye = normalize(fNormal); 
	
	vec3 lightDirN = normalize(lightPosEye.xyz - fPosEye.xyz);
	
	vec3 viewDirN = normalize(cameraPosEye - fPosEye.xyz);
	
	vec3 halfVector = normalize(lightDirN + viewDirN);
	
	vec3 reflection = reflect(-lightDirN, normalEye);
	
	float specCoeff = pow(max(dot(normalEye, halfVector), 0.0f), shininess);

	float dist = length(lightPosEye.xyz - fPosEye.xyz); 
	 
	float att = 1.0f / (constant + linear * dist + quadratic * (dist * dist));
	
	//compute ambient light 
	ambientPoint = att * ambientStrength * lightColorPoint;
	
	//compute diffuse light 
	diffusePoint = att * max(dot(normalEye, lightDirN), 0.0f) * lightColorPoint;
	
	specularPoint = att * specularStrength * specCoeff * lightColorPoint;

}

void main() 
{
	computeLightComponents();
	
	shadow = computeShadow();
	
	float fogFactor = computeFog();
	vec4 fogColor = vec4(1.0f, 1.0f, 1.0f, 1.0f);
	
	vec4 colorFromTexture = texture(diffuseTexture, fTexCoords);
	if(colorFromTexture.a < 0.1)
		discard;

	vec3 baseColor = vec3(0.9f, 0.35f, 0.0f);//orange
	
	if(lightPointOk == 1){
		computePointLights();
		ambient += ambientPoint;
		diffuse += diffusePoint;
		specular += specularPoint;
	}
	
	ambient *= texture(diffuseTexture, fTexCoords).rgb;
	diffuse *= texture(diffuseTexture, fTexCoords).rgb;
	specular *= texture(specularTexture, fTexCoords).rgb;

	vec3 color = min((ambient + (1.0f - shadow)*diffuse) + (1.0f - shadow)*specular, 1.0f);
	
	if(fogOk == 1){
	   fColor = fogColor * (1 - fogFactor) + vec4(color, 1.0f) * fogFactor;

	} 
	
	else {
		fColor = vec4(color, 1.0f);
	}
	
}
