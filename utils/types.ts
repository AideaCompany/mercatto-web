export type Producto = {_id:string,nombre:string,descripcion:string,precio:number,imagenes:{url:string},descuento?:number,precioDescuento?:number,peso?:string}
export interface Carrito {id?:string,_id?:string;cantidad:number;producto:Producto|string,precio?:number,peso?:string}
export type Pedidos = {_id?:string,carrito?:Carrito[],Terminado:boolean,createdAt?:string}
export type typeUser = {_id?:string,nombre?: string, jwt?:string, pedidos? : Pedidos[], carrito? :Carrito[], telefono?:string, email?:string, direccion?:string}