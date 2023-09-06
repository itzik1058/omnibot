export function randomExponential(scale: number) {
  return -Math.log(Math.random()) * scale;
}

export function randomErlang(shape: number, scale: number) {
  let random = 0;
  for (let index = 0; index < shape; index++) {
    random += randomExponential(scale);
  }
  return random;
}
