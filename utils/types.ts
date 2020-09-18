export type Producto = {_id:string,nombre:string,descripcion:string,precio:Number,imagenes:{url:string}}
export type Carrito = {_id?:string,cantidad:Number,producto:Producto}
export type Pedidos = {_id:string,carrito:[Carrito],Terminado:boolean}
export type typeUser = {_id?:string,nombre?: string, jwt?:string, pedidos? : [Pedidos]}