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
        case 'sum_pop_11':          return "Population 2011";
        case 'sum_pop_01':          return "Population 2001";
        case 'sum_pop_91':          return "Population 1991";
        case 'pop_den_11':          return "Pop Density 2011";
        case 'pop_den_01':          return "Pop Density 2001";
        case 'pop_den_91':          return "Pop Density 1991";
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