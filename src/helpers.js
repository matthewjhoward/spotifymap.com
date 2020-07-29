export function getFlag(id){
    if (id === 'GLOBAL'){
      return String.fromCodePoint(127758);
    }
    return id.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0)+127397) );
  }