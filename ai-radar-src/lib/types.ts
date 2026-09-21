export type Item={title:string;url:string;source:string;summary?:string;publishedAt?:string;rank:number;kind:'hot'|'recommended';metric?:string;reason?:string;via?:string;also?:string[]};
export type Feed={source:string;items:Item[];status:'ok'|'error'|'stale';message?:string;fetchedAt:string};
