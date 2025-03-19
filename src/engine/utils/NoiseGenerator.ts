export class NoiseGenerator {
  private static readonly PERM: number[] = NoiseGenerator.initPerm();
  private static readonly GRAD3: number[][] = [
    [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
    [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
    [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
  ];

  private static initPerm(): number[] {
    const p: number[] = [];
    // Initialize permutation
    for (let i = 0; i < 256; i++) {
      p[i] = Math.floor(Math.random() * 256);
    }
    
    // Extend to 512 elements
    for (let i = 0; i < 256; i++) {
      p[i + 256] = p[i];
    }
    
    return p;
  }

  public static generateNoise(width: number, height: number, scale: number = 1): number[][] {
    const noise: number[][] = [];
    for (let row = 0; row < height; row++) {
      noise[row] = [];
      for (let col = 0; col < width; col++) {
        noise[row][col] = this.noise2D(col / scale, row / scale);
      }
    }
    return noise;
  }

  private static noise2D(xin: number, yin: number): number {
    let n0, n1, n2;
    const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;
    let i1, j1;
    if (x0 > y0) {
      i1 = 1;
      j1 = 0;
    } else {
      i1 = 0;
      j1 = 1;
    }
    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1.0 + 2.0 * G2;
    const y2 = y0 - 1.0 + 2.0 * G2;
    const ii = i & 255;
    const jj = j & 255;
    const gi0 = this.PERM[(ii + this.PERM[jj]) & 255] % 12;
    const gi1 = this.PERM[(ii + i1 + this.PERM[jj + j1]) & 255] % 12;
    const gi2 = this.PERM[(ii + 1 + this.PERM[jj + 1]) & 255] % 12;
    const t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 < 0) n0 = 0.0;
    else {
      const t0_2 = t0 * t0;
      n0 = t0_2 * t0_2 * this.dot(this.GRAD3[gi0], x0, y0);
    }
    const t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 < 0) n1 = 0.0;
    else {
      const t1_2 = t1 * t1;
      n1 = t1_2 * t1_2 * this.dot(this.GRAD3[gi1], x1, y1);
    }
    const t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 < 0) n2 = 0.0;
    else {
      const t2_2 = t2 * t2;
      n2 = t2_2 * t2_2 * this.dot(this.GRAD3[gi2], x2, y2);
    }
    return 70.0 * (n0 + n1 + n2);
  }

  private static dot(g: number[], x: number, y: number): number {
    return g[0] * x + g[1] * y;
  }
} 