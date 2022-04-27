
precision highp float;


uniform vec2 resolution;
uniform sampler2D leavesTex;
uniform sampler2D branchTex;
uniform sampler2D flowTex;



void main(){
  vec3 outCol = vec3(.0);
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec2 uvWarp1;
  vec2 uvWarp2;
  
  //uv.y = 1.0 - uv.y;
  ///////////////
  
  float displacementStrength = 0.05;
  uv.y = 1.0 - uv.y;
  vec3 flow = texture2D(flowTex, uv).rgb;
  vec3 dispTex = texture2D(flowTex, uv).rgb;
  
  float n1 = dispTex.r;
  float n2 = dispTex.g;
  uv.x += n1 * displacementStrength;
  uv.y += n2 * displacementStrength;
  //////////////
  
  vec3 leaves = texture2D(leavesTex, uv).rgb;
  vec3 branches = texture2D(branchTex, uv).rgb;
  
  branches = vec3(branches.r);

  float l = leaves.r + leaves.g + leaves.b;
  float b = branches.r + branches.g + branches.b;
  float f = flow.r + flow.g + flow.g;

  /*
  if (l > .0) outCol += leaves;
  else if (b > .0) outCol += branches;
  */
  
  outCol += leaves + branches + flow * 0.25;
  //else outCol += flow;
  //flow = vec3(sin(flow.r * 100.0)) * 0.25;
  //outCol += leaves + flow + branches;
  
 
  gl_FragColor = vec4(outCol, 1.0);
}