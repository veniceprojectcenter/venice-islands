//object for dynamically adding to dictionary
var dictionary ={};

//translate property name to legible name
function lookup(original){
    if(dictionary.hasOwnProperty(original)){
        return dictionary[original];
    }
    switch (original){
        case 'Numero':              return "Island Number";
        case 'Nome_Isola':          return "Island Name";
        case 'Superficie':          return "Area";
        case 'sum_pop_11':          return "Population Total";
        case 'pop_den_11':          return "Population Density";
        case 'Codice':              return "ID Code";
        case 'Codice_Ses':          return "Sestiere";
        case 'Tipo':                return "Type";
        case 'Categoria':           return "Category";
        case 'Perimetro':           return "Perimeter";
        case 'Gndr_Ratio':          return "Genter Ratio (M:F)";
        case 'Avg_Age':             return "Average Age";
        case 'Insula_Num':          return "Insula Number";
        case 'Access_Han':          return "Handicap Access";
        default:                    return original;
    }
}