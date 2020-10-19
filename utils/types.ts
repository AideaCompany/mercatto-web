export type Producto = {
    _id: string,
    nombre: string,
    descripcion: string,
    precio: number,
    imagenes: {
        url: string
    },
    descuento ? : number,
    precioDescuento ? : number,
    peso ? : string,
    sub_categoria ? : string
    producto ? : ProductoCombo[]
}



export type ProductoCombo = {
    _id: string
    producto ? : Producto | ProductoCombo[]
    cantidad ? : number
    precio ? : number
    precioDescuento ? : number
    imagenes ? : {
        url: string
    },
    nombre ? : string,
    descripcion ? : string,

}


export interface Carrito {
    id ? : string, _id ? : string;
    cantidad: number;
    producto ? : Producto | string, precio ? : number, peso ? : string
    combo ? : ProductoCombo | string
}
export type Pedidos = {
    _id ? : string,
    carrito ? : Carrito[],
    Terminado: boolean,
    createdAt ? : string,
    total ? : number
}
export type typeUser = {
    _id ? : string,
    nombre ? : string,
    jwt ? : string,
    pedidos ? : Pedidos[],
    carrito ? : Carrito[],
    telefono ? : string,
    email ? : string,
    direccion ? : string,
    username ? : string
}

export type Ofertas = {
    _id: string
    Ofertas:  DataOfer[]
  }
  
export type DataOfer = {
      _id: string
      ref: Ref
  }
  
export type Ref = {
      _id: string
      titulo: string
      imagen: {url: string}
      productos: Producto[]
  }