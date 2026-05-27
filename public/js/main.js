// src/client/math.ts
var matXvec = (mat, vec) => {
  return [
    mat[0] * vec[0] + mat[1] * vec[1] + mat[2] * vec[2] + mat[3] * vec[3],
    mat[4] * vec[0] + mat[5] * vec[1] + mat[6] * vec[2] + mat[7] * vec[3],
    mat[8] * vec[0] + mat[9] * vec[1] + mat[10] * vec[2] + mat[11] * vec[3],
    mat[12] * vec[0] + mat[13] * vec[1] + mat[14] * vec[2] + mat[15] * vec[3]
  ];
};
var matXmat = (mat1, mat2) => {
  const result = new Array(16);
  for (let i = 0;i < 4; i++) {
    for (let j = 0;j < 4; j++) {
      result[i * 4 + j] = 0;
      for (let k = 0;k < 4; k++) {
        result[i * 4 + j] += mat1[i * 4 + k] * mat2[k * 4 + j];
      }
    }
  }
  return result;
};
var dot = (vec1, vec2) => {
  return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2];
};
var vecXvec = (vec1, vec2) => {
  return [
    vec1[1] * vec2[2] - vec1[2] * vec2[1],
    vec1[2] * vec2[0] - vec1[0] * vec2[2],
    vec1[0] * vec2[1] - vec1[1] * vec2[0]
  ];
};
var sub = (vec1, vec2) => {
  return [vec1[0] - vec2[0], vec1[1] - vec2[1], vec1[2] - vec2[2]];
};
var lengthVec = (vec) => {
  return Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
};
var normalize = (vec) => {
  const len = lengthVec(vec);
  return [vec[0] / len, vec[1] / len, vec[2] / len];
};
var reflectLight = (l, n) => {
  const nCoeff = 2 * dot(n, l);
  return [
    n[0] * nCoeff - l[0],
    n[1] * nCoeff - l[1],
    n[2] * nCoeff - l[2]
  ];
};

// src/client/main.ts
var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
var positions = [
  0.5,
  0.5,
  -0.5,
  0.5,
  -0.5,
  -0.5,
  -0.5,
  -0.5,
  -0.5,
  -0.5,
  0.5,
  -0.5,
  0.5,
  0.5,
  0.5,
  -0.5,
  0.5,
  0.5,
  -0.5,
  -0.5,
  0.5,
  0.5,
  -0.5,
  0.5,
  0.5,
  0.5,
  -0.5,
  0.5,
  0.5,
  0.5,
  0.5,
  -0.5,
  0.5,
  0.5,
  -0.5,
  -0.5,
  0.5,
  -0.5,
  -0.5,
  0.5,
  -0.5,
  0.5,
  -0.5,
  -0.5,
  0.5,
  -0.5,
  -0.5,
  -0.5,
  -0.5,
  -0.5,
  -0.5,
  -0.5,
  -0.5,
  0.5,
  -0.5,
  0.5,
  0.5,
  -0.5,
  0.5,
  -0.5,
  0.5,
  0.5,
  0.5,
  0.5,
  0.5,
  -0.5,
  -0.5,
  0.5,
  -0.5,
  -0.5,
  0.5,
  0.5
];
var indices = [
  0,
  2,
  3,
  0,
  1,
  2,
  4,
  6,
  7,
  4,
  5,
  6,
  8,
  10,
  11,
  8,
  9,
  10,
  12,
  14,
  15,
  12,
  13,
  14,
  16,
  18,
  19,
  16,
  17,
  18,
  20,
  22,
  23,
  20,
  21,
  22
];
var worldMat = localStorage.getItem("worldMat") ? JSON.parse(localStorage.getItem("worldMat")) : [
  0.681734356384162,
  0.5594849272637089,
  0.47139673682599886,
  0,
  -0.6343932841636476,
  0.7730104533627378,
  -0.0000000000000000971445146547012,
  0,
  -0.3643946052475806,
  -0.29905092401907085,
  0.8819212643483575,
  0,
  0,
  0,
  0,
  1
];
var xRotationMat = (angle) => [
  1,
  0,
  0,
  0,
  0,
  Math.cos(angle),
  -Math.sin(angle),
  0,
  0,
  Math.sin(angle),
  Math.cos(angle),
  0,
  0,
  0,
  0,
  1
];
var yRotationMat = (angle) => [
  Math.cos(angle),
  0,
  Math.sin(angle),
  0,
  0,
  1,
  0,
  0,
  -Math.sin(angle),
  0,
  Math.cos(angle),
  0,
  0,
  0,
  0,
  1
];
var zRotationMat = (angle) => [
  Math.cos(angle),
  -Math.sin(angle),
  0,
  0,
  Math.sin(angle),
  Math.cos(angle),
  0,
  0,
  0,
  0,
  1,
  0,
  0,
  0,
  0,
  1
];
var rgbToHex = (rgb) => {
  let hex = Number(rgb).toString(16);
  if (hex.length < 2) {
    hex = "0" + hex;
  }
  return hex;
};
var fullColorHex = (r, g, b) => {
  const red = rgbToHex(r);
  const green = rgbToHex(g);
  const blue = rgbToHex(b);
  return red + green + blue;
};
var hitTriangle = (rayOrigin, rayVector, pos1, pos2, pos3) => {
  const EPSILON = 0.000001;
  const edge1 = sub(pos2, pos1);
  const edge2 = sub(pos3, pos1);
  const h = vecXvec(rayVector, edge2);
  const a = dot(edge1, h);
  if (a > -EPSILON && a < EPSILON) {
    return;
  }
  const f = 1 / a;
  const s = sub(rayOrigin, pos1);
  const u = f * dot(s, h);
  if (u < 0 || u > 1) {
    return;
  }
  const q = vecXvec(s, edge1);
  const v = f * dot(rayVector, q);
  if (v < 0 || u + v > 1) {
    return;
  }
  const t = f * dot(edge2, q);
  if (t > EPSILON) {
    return { t, u, v };
  }
  return;
};
ctx.beginPath();
ctx.lineWidth = 2;
ctx.strokeStyle = "white";
var projTo2D = (vec4d) => {
  return [vec4d[0] * 175 + 175, 350 - (vec4d[1] * 175 + 175)];
};
var worldPositions = [];
var computeWorldPositions = () => {
  worldPositions.length = 0;
  for (let i = 0;i < indices.length; i += 3) {
    const ind1 = indices[i];
    const ind2 = indices[i + 1];
    const ind3 = indices[i + 2];
    const pos1 = matXvec(worldMat, [positions[ind1 * 3], positions[ind1 * 3 + 1], positions[ind1 * 3 + 2], 0]);
    const pos2 = matXvec(worldMat, [positions[ind2 * 3], positions[ind2 * 3 + 1], positions[ind2 * 3 + 2], 0]);
    const pos3 = matXvec(worldMat, [positions[ind3 * 3], positions[ind3 * 3 + 1], positions[ind3 * 3 + 2], 0]);
    worldPositions.push(pos1);
    worldPositions.push(pos2);
    worldPositions.push(pos3);
  }
};
computeWorldPositions();
var cameraPos = [0, 0, 5];
var lightPos = localStorage.getItem("lightPos") ? JSON.parse(localStorage.getItem("lightPos")) : [32, 1, 16];
var lightPosDiv = document.getElementById("lightPos");
lightPosDiv.innerHTML = "Position de la lumière :" + JSON.stringify(lightPos);
var tracing = false;
var restartTracing = false;
var raytrace = async () => {
  tracing = true;
  do {
    ctx.clearRect(0, 0, 350, 350);
    restartTracing = false;
    for (let pass = 16;pass >= 2; pass /= 2) {
      for (let y = -1;y < 1; y += 1 / 175 * pass) {
        for (let x = -1;x < 1; x += 1 / 175 * pass) {
          const pixelPos = [x, y, 0];
          const rayDir = normalize(sub(pixelPos, cameraPos));
          let closestT = Infinity;
          let hitPoint = undefined;
          let hitNormal = undefined;
          for (let i = 0;i < worldPositions.length; i += 3) {
            const p1 = [worldPositions[i][0], worldPositions[i][1], worldPositions[i][2]];
            const p2 = [worldPositions[i + 1][0], worldPositions[i + 1][1], worldPositions[i + 1][2]];
            const p3 = [worldPositions[i + 2][0], worldPositions[i + 2][1], worldPositions[i + 2][2]];
            const hit = hitTriangle(cameraPos, rayDir, p1, p2, p3);
            if (hit && hit.t < closestT) {
              closestT = hit.t;
              hitPoint = [
                cameraPos[0] + hit.t * rayDir[0],
                cameraPos[1] + hit.t * rayDir[1],
                cameraPos[2] + hit.t * rayDir[2]
              ];
              const edge1 = sub(p2, p1);
              const edge2 = sub(p3, p1);
              hitNormal = normalize(vecXvec(edge1, edge2));
            }
          }
          let color = 10;
          if (hitPoint && hitNormal) {
            const ambient = 30;
            const L = normalize(sub(lightPos, hitPoint));
            let nDotL = dot(hitNormal, L);
            if (nDotL < 0)
              nDotL = 0;
            const diffuse = 180 * nDotL;
            const V = normalize(sub(cameraPos, hitPoint));
            const R = reflectLight(L, hitNormal);
            let vDotR = dot(V, R);
            if (vDotR < 0)
              vDotR = 0;
            const specular = 150 * Math.pow(vDotR, 16);
            color = Math.min(255, Math.floor(ambient + diffuse + specular));
          }
          ctx.strokeStyle = "#" + fullColorHex(color, color, color);
          const screenPos = projTo2D([x, y, 0, 0]);
          ctx.strokeRect(screenPos[0], screenPos[1], 0.5, 0.5);
        }
        if (restartTracing)
          break;
      }
      await new Promise((resolve) => setTimeout(resolve, 0));
      if (restartTracing)
        break;
    }
  } while (restartTracing);
  tracing = false;
};
window.onkeypress = (ev) => {
  if (ev.key == "w")
    lightPos[0] += 1;
  if (ev.key == "q")
    lightPos[0] -= 1;
  if (ev.key == "s")
    lightPos[1] += 1;
  if (ev.key == "a")
    lightPos[1] -= 1;
  if (ev.key == "x")
    lightPos[2] += 1;
  if (ev.key == "y")
    lightPos[2] -= 1;
  if (ev.key == "r") {
    worldMat = matXmat(worldMat, yRotationMat(Math.PI / 32));
    computeWorldPositions();
  }
  if (ev.key == "e") {
    worldMat = matXmat(worldMat, yRotationMat(-Math.PI / 32));
    computeWorldPositions();
  }
  if (ev.key == "f") {
    worldMat = matXmat(worldMat, xRotationMat(Math.PI / 32));
    computeWorldPositions();
  }
  if (ev.key == "d") {
    worldMat = matXmat(worldMat, xRotationMat(-Math.PI / 32));
    computeWorldPositions();
  }
  if (ev.key == "v") {
    worldMat = matXmat(worldMat, zRotationMat(-Math.PI / 32));
    computeWorldPositions();
  }
  if (ev.key == "c") {
    worldMat = matXmat(worldMat, zRotationMat(Math.PI / 32));
    computeWorldPositions();
  }
  if (ev.key == "§") {
    worldMat = [
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ];
    computeWorldPositions();
  }
  localStorage.setItem("lightPos", JSON.stringify(lightPos));
  localStorage.setItem("worldMat", JSON.stringify(worldMat));
  lightPosDiv.innerHTML = "Position de la lumière :" + JSON.stringify(lightPos);
  if (tracing)
    restartTracing = true;
  else
    raytrace();
};
raytrace();
export {
  rgbToHex,
  hitTriangle,
  fullColorHex
};
