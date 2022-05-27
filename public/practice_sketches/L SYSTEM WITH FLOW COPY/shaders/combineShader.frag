
precision highp float;


uniform vec2 resolution;
uniform sampler2D leavesTex;

uniform sampler2D flowTex;

uniform float time;

varying vec2 vTexCoord;

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

void main(){
  vec3 outCol = vec3(.0);
  vec2 uv = vTexCoord;
  vec2 uvWarp1;
  vec2 uvWarp2;
  
  //uv.y = 1.0 - uv.y;
  ///////////////
  // pixel displacement strength
  float displacementStrength = 0.05;
  uv.y = 1.0 - uv.y;

  float treetex = step(.0, sin(uv.x * 1000.0 + time));

  vec2 leavesTexUV = uv;
  vec2 branchTexUV = uv;
  vec3 flow = texture2D(flowTex, uv).rgb;
  vec3 dispTex = texture2D(flowTex, uv).rgb;
  
  float n1 = dispTex.r;
  float n2 = dispTex.g;
  uv.x += n1 * displacementStrength;
  uv.y += n2 * displacementStrength;

  leavesTexUV.x += n1 * displacementStrength;
  leavesTexUV.y += n2 * displacementStrength;

  branchTexUV.x += n1 * displacementStrength;
  branchTexUV.y += n2 * displacementStrength;


  
  //////////////
  
  vec3 leaves = texture2D(leavesTex, leavesTexUV).rgb;
  //vec3 branches = texture2D(branchTex, branchTexUV).rgb;

  //branches = vec3(branches.r);

  float l = leaves.r + leaves.g + leaves.b;
  //float b = branches.r + branches.g + branches.b;
  float f = flow.r + flow.g + flow.g;

  float r = 0.4 + 0.2 * sin(time) + 0.2 * sin(flow.r * 21.0);
  float g = 0.2 + 0.1 * cos(flow.g * 13.0);
  vec3 flow2 = vec3(r, g, 0.5 + 0.2 * cos(time * 1.2));
  
  if (l > .0) {
    outCol += leaves;
    
   
  }
 
  else {
    //if (mod(uv.x, 0.1) < 0.01) discard;
    outCol += flow * 2.0;
  }

  if (outCol.r + outCol.g + outCol.b < 0.2) outCol = flow * 2.0;
  
 
 
  gl_FragColor = vec4(outCol, 1.0);
}