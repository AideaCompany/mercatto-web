import React, {useState, useEffect} from 'react'
//nextjs
import router from 'next/router'
//antD
import {AutoComplete, Input} from 'antd'
import {SearchOutlined} from '@ant-design/icons';
import { Producto } from '../utils/types';
import { SelectProps } from 'antd/lib/select';

type PropsAutoComplete = {
    dataProducts: Producto[]

}

const Autocomplete = (props:PropsAutoComplete) =>{

    //Props
    const {dataProducts} = props

    //State
    const [searchWord, setSearchWord] = useState<string>('')
    const [options, setOptions] = useState<SelectProps<object>['options']>([]);

    //Effect
    useEffect(() => {
        var tempLabel: SelectProps<object>['options']= []
        var tempValue = []
        for (let k = 0; k < dataProducts.length; k++) {
            var isInTemp = tempValue.findIndex(e=>e === dataProducts[k].nombre)
            if (isInTemp===-1) {
                tempLabel.push({value:dataProducts[k].nombre})
                tempValue.push(dataProducts[k].nombre)
            }
        }
        setOptions(tempLabel)
    }, [dataProducts])

    return(
        <AutoComplete 
            filterOption={(inputValue, option) =>
                option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
            }
            options={options} 
            onChange={(e)=>setSearchWord(e)}
            >
            <Input onPressEnter={(e)=>{searchWord!== '' ? router.push(`/productos/${searchWord}`): null}} prefix={<SearchOutlined />}  placeholder={"Buscar"}></Input>
        </AutoComplete>
    )
} 

export default Autocomplete