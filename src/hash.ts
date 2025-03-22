export function random(len: number) {
  const hashSet =
    "qwertyuioplkjhgfdsazxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM1234567890";
  const length = hashSet.length;

  let hash = "";
  for (let i = 0; i < len; i++) {
    hash += hashSet[Math.floor(Math.random() * length)];
  }

  return hash;
}
