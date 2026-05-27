export type vec3 = [number, number, number];
export type vec4 = [number, number, number, number];
export type Mat4 = [
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
    number, number, number, number
];

/**
 * Multiplication d'un vecteur par une matrice
 */
export const matXvec = (mat: Mat4, vec: vec4): vec4 => {
    return [
        mat[0] * vec[0] + mat[1] * vec[1] + mat[2] * vec[2] + mat[3] * vec[3],
        mat[4] * vec[0] + mat[5] * vec[1] + mat[6] * vec[2] + mat[7] * vec[3],
        mat[8] * vec[0] + mat[9] * vec[1] + mat[10] * vec[2] + mat[11] * vec[3],
        mat[12] * vec[0] + mat[13] * vec[1] + mat[14] * vec[2] + mat[15] * vec[3]
    ];
};

/**
 * Multiplication d'une matrice par une matrice
 */
export const matXmat = (mat1: Mat4, mat2: Mat4): Mat4 => {
    const result: number[] = new Array(16);
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            result[i * 4 + j] = 0;
            for (let k = 0; k < 4; k++) {
                result[i * 4 + j]! += mat1[i * 4 + k]! * mat2[k * 4 + j]!;
            }
        }
    }
    return result as Mat4;
};

/**
 * Calcule la transposée d'une matrice
 */
export const transpose = (mat: Mat4): Mat4 => {
    const result: number[] = new Array(16);
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            result[i * 4 + j] = mat[j * 4 + i]!;
        }
    }
    return result as Mat4;
};

/**
 * Produit scalaire de 2 vecteurs
 */
export const dot = (vec1: vec3, vec2: vec3): number => {
    return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2];
};

/**
 * Produit vectoriel de 2 vecteurs
 */
export const vecXvec = (vec1: vec3, vec2: vec3): vec3 => {
    return [
        vec1[1] * vec2[2] - vec1[2] * vec2[1],
        vec1[2] * vec2[0] - vec1[0] * vec2[2],
        vec1[0] * vec2[1] - vec1[1] * vec2[0]
    ];
};

/**
 * Soustraction de vecteurs
 */
export const sub = (vec1: vec3, vec2: vec3): vec3 => {
    return [vec1[0] - vec2[0], vec1[1] - vec2[1], vec1[2] - vec2[2]];
};

/**
 * Inverse la direction d'un vecteur
 */
export const inv = (vec: vec3): vec3 => {
    return [-vec[0], -vec[1], -vec[2]];
};

/**
 * Calcule la longueur d'un vecteur
 */
export const lengthVec = (vec: vec3): number => {
    return Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
};

/**
 * Normalise un vecteur
 */
export const normalize = (vec: vec3): vec3 => {
    const len = lengthVec(vec);
    return [vec[0] / len, vec[1] / len, vec[2] / len];
};

/**
 * Calcule la distance entre deux points
 */
export const distance = (vec1: vec3, vec2: vec3): number => {
    return lengthVec(sub(vec2, vec1));
};

/**
 * Calcul le reflet d'un vecteur lumière par rapport à une normale
 */
export const reflectLight = (l: vec3, n: vec3): vec3 => {
    const nCoeff = 2 * dot(n, l);
    return [
        n[0] * nCoeff - l[0],
        n[1] * nCoeff - l[1],
        n[2] * nCoeff - l[2]
    ];
};

/**
 * Refraction d'un vecteur incident dans un milieu
 */
export const refract = (i: vec3, n: vec3, eta: number): vec3 => {
    const dotni = dot(n, i);
    const k = 1 - eta * eta * (1 - dotni * dotni);
    if (k < 0) {
        return [0, 0, 0];
    } else {
        const sqrtk = Math.sqrt(k);
        return [
            eta * i[0] - (eta * dotni + sqrtk) * n[0],
            eta * i[1] - (eta * dotni + sqrtk) * n[1],
            eta * i[2] - (eta * dotni + sqrtk) * n[2],
        ];
    }
};

/**
 * Inversion de matrice
 */
export const invertMat = (mat: Mat4): Mat4 => {
    const
    a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3],
    a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7],
    a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11],
    a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15],
    b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10,
    b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11,
    b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12,
    b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30,
    b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31,
    b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32,

    det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    return [
        (a11 * b11 - a12 * b10 + a13 * b09) / det,
        (a02 * b10 - a01 * b11 - a03 * b09) / det,
        (a31 * b05 - a32 * b04 + a33 * b03) / det,
        (a22 * b04 - a21 * b05 - a23 * b03) / det,
        (a12 * b08 - a10 * b11 - a13 * b07) / det,
        (a00 * b11 - a02 * b08 + a03 * b07) / det,
        (a32 * b02 - a30 * b05 - a33 * b01) / det,
        (a20 * b05 - a22 * b02 + a23 * b01) / det,
        (a10 * b10 - a11 * b08 + a13 * b06) / det,
        (a01 * b08 - a00 * b10 - a03 * b06) / det,
        (a30 * b04 - a31 * b02 + a33 * b00) / det,
        (a21 * b02 - a20 * b04 - a23 * b00) / det,
        (a11 * b07 - a10 * b09 - a12 * b06) / det,
        (a00 * b09 - a01 * b07 + a02 * b06) / det,
        (a31 * b01 - a30 * b03 - a32 * b00) / det,
        (a20 * b03 - a21 * b01 + a22 * b00) / det
    ];
};
