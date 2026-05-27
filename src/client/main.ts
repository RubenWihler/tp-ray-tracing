import { 
    type vec3, type vec4, type Mat4, 
    matXvec, matXmat, transpose,
    sub,
    dot,
    vecXvec,
    normalize,
    reflectLight
} from './math';

const canvas = document.querySelector('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

/**
 * Cube centré sur 0,0,0 de hauteur, largeur, profondeur de 1
 */
const positions: number[] = [
    0.5, 0.5, -0.5,   0.5, -0.5, -0.5,  -0.5, -0.5, -0.5,  -0.5, 0.5, -0.5,
    0.5, 0.5, 0.5,   -0.5, 0.5, 0.5,    -0.5, -0.5, 0.5,    0.5, -0.5, 0.5,
    0.5, 0.5, -0.5,   0.5, 0.5, 0.5,     0.5, -0.5, 0.5,    0.5, -0.5, -0.5,
    0.5, -0.5, -0.5,  0.5, -0.5, 0.5,   -0.5, -0.5, 0.5,   -0.5, -0.5, -0.5,
    -0.5, -0.5, -0.5, -0.5, -0.5, 0.5,   -0.5, 0.5, 0.5,    -0.5, 0.5, -0.5,
    0.5, 0.5, 0.5,    0.5, 0.5, -0.5,   -0.5, 0.5, -0.5,   -0.5, 0.5, 0.5
];

const indices: number[] = [
    0,  2,  3,    0,  1,  2,
    4,  6,  7,    4,  5,  6,
    8, 10, 11,    8,  9, 10,
    12, 14, 15,   12, 13, 14,
    16, 18, 19,   16, 17, 18,
    20, 22, 23,   20, 21, 22
];

/**
 * Matrice de mise en place du cube dans la scène
 */
let worldMat: Mat4 = localStorage.getItem('worldMat') ? JSON.parse(localStorage.getItem('worldMat')!) : [
    0.681734356384162, 0.5594849272637089, 0.47139673682599886, 0,
    -0.6343932841636476, 0.7730104533627378, -9.71445146547012e-17, 0,
    -0.3643946052475806, -0.29905092401907085, 0.8819212643483575, 0,
    0, 0, 0, 1
];

/**
 * Inverse de la matrice de vue
 */
const invViewMat: Mat4 = [
    -0.7071067690849304, -0, 0.7071067690849304, -0,
    -0.5, 0.7071067690849304, -0.5, 0,
    -0.5, -0.7071067690849304, -0.5, -0,
    2, 2.8284270763397217, 2, 1
];

/** Construit une matrice de rotation autour de x */
const xRotationMat = (angle: number): Mat4 => [
    1, 0, 0, 0,
    0, Math.cos(angle), -Math.sin(angle), 0,
    0, Math.sin(angle), Math.cos(angle), 0,
    0, 0, 0, 1
];

/** Construit une matrice de rotation autour de y */
const yRotationMat = (angle: number): Mat4 => [
    Math.cos(angle), 0, Math.sin(angle), 0,
    0, 1, 0, 0,
    -Math.sin(angle), 0, Math.cos(angle), 0,
    0, 0, 0, 1
];

/** Construit une matrice de rotation autour de z */
const zRotationMat = (angle: number): Mat4 => [
    Math.cos(angle), -Math.sin(angle), 0, 0,
    Math.sin(angle), Math.cos(angle), 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
];

/** Converti un nombre en hexadecimal jusqu'à 255 */
export const rgbToHex = (rgb: number | string): string => {
    let hex = Number(rgb).toString(16);
    if (hex.length < 2) {
        hex = "0" + hex;
    }
    return hex;
};

/** Converti 3 valeur r,b,g en couleur hexadécimale */
export const fullColorHex = (r: number, g: number, b: number): string => {
    const red = rgbToHex(r);
    const green = rgbToHex(g);
    const blue = rgbToHex(b);
    return red + green + blue;
};

/**
 * Test si un rayon rencontre un triangle (Möller–Trumbore)
 * rayOrigin: position d'origine du rayon (l'œil de la caméra)
 * rayVector: direction du rayon
 * pos1, pos2, pos3: positions des 3 sommets du triangle dans l'espace de la scène
 */
export const hitTriangle = (
  rayOrigin: vec3, 
  rayVector: vec3, 
  pos1: vec3, 
  pos2: vec3, 
  pos3: vec3
): { t: number; u: number; v: number } | undefined => {
  const EPSILON = 0.000001;

  // Calcul des deux vecteurs directeurs des arêtes du triangle
  const edge1 = sub(pos2, pos1); // Arête 1 -> (B - A)
  const edge2 = sub(pos3, pos1); // Arête 2 -> (C - A)

  // Calcul du vecteur h (produit vectoriel de la direction du rayon et edge2)
  const h = vecXvec(rayVector, edge2);

  // Calcul du déterminant (produit scalaire de edge1 et h)
  const a = dot(edge1, h);

  // Si le déterminant est proche de 0, le rayon est parallèle au plan du triangle
  if (a > -EPSILON && a < EPSILON) {
    return undefined;
  }

  const f = 1.0 / a;
  
  // Vecteur reliant l'origine du rayon au premier sommet du triangle
  const s = sub(rayOrigin, pos1);

  // Calcul de la première coordonnée barycentrique u
  const u = f * dot(s, h);

  // Si u est en dehors de [0, 1], le point d'intersection est hors du triangle
  if (u < 0.0 || u > 1.0) {
    return undefined;
  }

  // Calcul du vecteur q
  const q = vecXvec(s, edge1);

  // Calcul de la deuxième coordonnée barycentrique v
  const v = f * dot(rayVector, q);

  // Si v < 0 ou u + v > 1, le point d'intersection est hors du triangle
  if (v < 0.0 || u + v > 1.0) {
    return undefined;
  }

  // Calcul de la distance t sur le rayon où se trouve l'intersection
  const t = f * dot(edge2, q);

  // Si t est positif, le triangle est devant la caméra (pas derrière)
  if (t > EPSILON) {
    return { t, u, v };
  }

  return undefined;
};

/** Initialisation du context du canvas */
ctx.beginPath();
ctx.lineWidth = 2;
ctx.strokeStyle = "white";

/** Transformation des coordonnées projectée en coordonnées dans le Canvas */
const projTo2D = (vec4d: vec4): [number, number] => {
    return [vec4d[0] * 175 + 175, 350 - (vec4d[1] * 175 + 175)];
};

const worldPositions: vec4[] = [];

/**
 * Calcule les positions des triangles dans les coordonnées de la scene
 * Evite de recalculer pendant le raytracing
 */
const computeWorldPositions = (): void => {
    worldPositions.length = 0;
    for (let i = 0; i < indices.length; i += 3) {
        // Utilisation de l'opérateur ! pour garantir à TypeScript que l'index existe
        const ind1 = indices[i]!;
        const ind2 = indices[i + 1]!;
        const ind3 = indices[i + 2]!;

        const pos1 = matXvec(worldMat, [positions[ind1 * 3]!, positions[ind1 * 3 + 1]!, positions[ind1 * 3 + 2]!, 0]);
        const pos2 = matXvec(worldMat, [positions[ind2 * 3]!, positions[ind2 * 3 + 1]!, positions[ind2 * 3 + 2]!, 0]);
        const pos3 = matXvec(worldMat, [positions[ind3 * 3]!, positions[ind3 * 3 + 1]!, positions[ind3 * 3 + 2]!, 0]);

        worldPositions.push(pos1);
        worldPositions.push(pos2);
        worldPositions.push(pos3);
    }
};

/** Précalcule les sommets dans triangles dans les coordonnées de la scène */
computeWorldPositions();

/** Position de la caméra */
const cameraPos: vec3 = [0, 0, 5];

/** Position de la source de lumière */
const lightPos: vec3 = (localStorage.getItem('lightPos') ? JSON.parse(localStorage.getItem('lightPos')!) : [32, 1, 16]) as vec3;

/** Affichage de la position de la lumière */
const lightPosDiv = document.getElementById('lightPos') as HTMLDivElement;
lightPosDiv.innerHTML = 'Position de la lumière :' + JSON.stringify(lightPos);

/** la raytracing est en cours */
let tracing = false;
/** demande de redémarrage du raytracing */
let restartTracing = false;



/** Fonction de raytracing asynchrone */
const raytrace = async (): Promise<void> => {
    tracing = true;
    do {
        /** Efface le rectangle du canevas */
        ctx.clearRect(0, 0, 350, 350);
        restartTracing = false;

        /** Effectue plusieurs passages pour calculer plus vite */
        for (let pass = 16; pass >= 2; pass /= 2) {
            /** Parcours le plan z = 0 pour envoyer des rayons de la caméra à la scene */
            for (let y = -1; y < 1; y += (1 / 175) * pass) {
                for (let x = -1; x < 1; x += (1 / 175) * pass) {
                    // 1. Définir le rayon
                    const pixelPos: vec3 = [x, y, 0];
                    const rayDir = normalize(sub(pixelPos, cameraPos));

                    let closestT = Infinity;
                    let hitPoint: vec3 | undefined = undefined;
                    let hitNormal: vec3 | undefined = undefined;

                    // 2. Parcourir les triangles pour trouver l'intersection la plus proche
                    for (let i = 0; i < worldPositions.length; i += 3) {
                        // Extraction des sommets du triangle (passage de vec4 à vec3)
                        const p1: vec3 = [worldPositions[i]![0], worldPositions[i]![1], worldPositions[i]![2]];
                        const p2: vec3 = [worldPositions[i+1]![0], worldPositions[i+1]![1], worldPositions[i+1]![2]];
                        const p3: vec3 = [worldPositions[i+2]![0], worldPositions[i+2]![1], worldPositions[i+2]![2]];

                        const hit = hitTriangle(cameraPos, rayDir, p1, p2, p3);

                        if (hit && hit.t < closestT) {
                        closestT = hit.t;
                        
                        // Coordonnées du point d'impact : P = Origine + t * Direction
                        hitPoint = [
                            cameraPos[0] + hit.t * rayDir[0],
                            cameraPos[1] + hit.t * rayDir[1],
                            cameraPos[2] + hit.t * rayDir[2]
                        ];
                        
                        // Calcul de la normale de la face (produit vectoriel des 2 arêtes)
                        const edge1 = sub(p2, p1);
                        const edge2 = sub(p3, p1);
                        hitNormal = normalize(vecXvec(edge1, edge2));
                        }
                    }

                    // 3. Calculer la couleur finale
                    let color = 10; // Couleur de fond (presque noir)

                    if (hitPoint && hitNormal) {
                        // --- ECLAIRAGE PHONG ---
                        
                        // a. Lumière ambiante constante
                        const ambient = 30; 

                        // b. Lumière Diffuse
                        const L = normalize(sub(lightPos, hitPoint)); // Vecteur vers la lumière
                        let nDotL = dot(hitNormal, L);
                        
                        // Si le produit scalaire est négatif, la face est à l'ombre (tourne le dos à la lumière)
                        if (nDotL < 0) nDotL = 0; 
                        const diffuse = 180 * nDotL;

                        // c. Lumière Spéculaire (le reflet brillant)
                        const V = normalize(sub(cameraPos, hitPoint)); // Vecteur vers la caméra
                        
                        // Selon le cours, R = 2(N.L)N - L
                        const R = reflectLight(L, hitNormal); 
                        
                        let vDotR = dot(V, R);
                        if (vDotR < 0) vDotR = 0;
                        // On élève à une puissance (shininess) pour rétrécir le point brillant
                        const specular = 150 * Math.pow(vDotR, 16); 

                        // Couleur finale : Ambiante + Diffuse + Spéculaire (bornée à 255)
                        color = Math.min(255, Math.floor(ambient + diffuse + specular));
                    }

                    /** Dessine un pixel de la couleur color */
                    ctx.strokeStyle = '#' + fullColorHex(color, color, color);
                    const screenPos = projTo2D([x, y, 0, 0]);
                    ctx.strokeRect(screenPos[0], screenPos[1], 0.5, 0.5);}
                if (restartTracing) break;
            }
            await new Promise(resolve => setTimeout(resolve, 0));
            if (restartTracing) break;
        }
    } while (restartTracing);
    tracing = false;
};

window.onkeypress = (ev: KeyboardEvent): void => {
    if (ev.key == 'w') lightPos[0] += 1;
    if (ev.key == 'q') lightPos[0] -= 1;
    if (ev.key == 's') lightPos[1] += 1;
    if (ev.key == 'a') lightPos[1] -= 1;
    if (ev.key == 'x') lightPos[2] += 1;
    if (ev.key == 'y') lightPos[2] -= 1;

    if (ev.key == 'r') {
        worldMat = matXmat(worldMat, yRotationMat(Math.PI / 32));
        computeWorldPositions();
    }
    if (ev.key == 'e') {
        worldMat = matXmat(worldMat, yRotationMat(-Math.PI / 32));
        computeWorldPositions();
    }
    if (ev.key == 'f') {
        worldMat = matXmat(worldMat, xRotationMat(Math.PI / 32));
        computeWorldPositions();
    }
    if (ev.key == 'd') {
        worldMat = matXmat(worldMat, xRotationMat(-Math.PI / 32));
        computeWorldPositions();
    }
    if (ev.key == 'v') {
        worldMat = matXmat(worldMat, zRotationMat(-Math.PI / 32));
        computeWorldPositions();
    }
    if (ev.key == 'c') {
        worldMat = matXmat(worldMat, zRotationMat(Math.PI / 32));
        computeWorldPositions();
    }
    if (ev.key == '§') {
        worldMat = [
            1, 0, 0, 0,  0, 1, 0, 0,  0, 0, 1, 0,  0, 0, 0, 1
        ];
        computeWorldPositions();
    }
    localStorage.setItem('lightPos', JSON.stringify(lightPos));
    localStorage.setItem('worldMat', JSON.stringify(worldMat));
    lightPosDiv.innerHTML = 'Position de la lumière :' + JSON.stringify(lightPos);

    if (tracing) restartTracing = true; 
        else raytrace();
};

raytrace();
