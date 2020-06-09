export class JwtDataDto {
  role: 'administrator' | 'user';
  id: number;
  identity: string;
  exp: number;
  ip: string;
  ua: string;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  toPlainObject() {
    return {
      role: this.role,
      id: this.id,
      identity: this.identity,
      ext: this.exp,
      ip: this.ip,
      ua: this.ua,
    };
  }
}
