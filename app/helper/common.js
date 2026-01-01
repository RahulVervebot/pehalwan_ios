import getSymbolFromCurrency from "currency-symbol-map"

export const getPrice = (price,currency) => {
    const symbol = getSymbolFromCurrency(currency.symbol)
    const  realval = JSON.parse(price).toFixed(currency.decimalNum);
    const val2 = priceTh(JSON.stringify(realval));

    const val3 = JSON.parse(val2).split(".");

    const showVal = val3[0] +currency.decimal+val3[1];

    function priceTh(nStr) {
        nStr += '';
        var x = nStr.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + currency.thousand + '$2');
        }
        return x1 + x2;
    }

    if(currency.position === "left" || currency.position === "left_space"){
        return symbol +`${currency.position === "left_space" ? " " : ""}`+ showVal;
    }
    if(currency.position === "right" || currency.position === "right_space"){
        return showVal +`${currency.position === "right_space" ? " " : ""}`+ symbol;
    }
}

export const getTaxRate = (price, taxClass, taxRates, taxStatus) => {
  
    var tax = 0;

    taxRates.list.map((data) => {

        if(taxClass === "" && data.class === "standard" && data.name === "sale"){
            //console.log(price,taxClass,taxRates,taxStatus);
            tax = price * data.rate / 100
        }

        if(taxClass === data.class){
            tax = price * data.rate / 100
        }

    })

    if(taxStatus === "taxable"){    
        return tax;
    }else{
        return 0;
    }

    
}