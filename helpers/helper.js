const publicApiKey = 'aHR0cHM6Ly9hcGkudmV2aW96LmNvbS9hcGkvYnV0dG9u';
const publicKey = 'LnRleHQtc2hhZG93LTE=';
const helper = {
    isValidLink(string) {
        let url; 
        try {
          url = new URL(string);
        } catch (e) {
          return false 
        }
      
        return url.protocol === "http:" || url.protocol === "https:";
      },
      getPrivatekey(params){
        if(params){
          return helper.getVideoBuffer(publicApiKey)
        }
        return false;
      },
      getVideoInfo($child,$){
        const buffer = helper.getVideoBuffer(publicKey)
        const $divs = $child.find(buffer);
        const format  =  $divs.length > 0 ?  $($divs[0]).text().trim() : '' ;
        const quality  =  $divs.length > 1 ?  $($divs[1]).text().trim() : '' ;
        const size  =  $divs.length > 2 ?  $($divs[2]).text().trim() : '' ;
        const link  =  $child.attr('href') ;
        return {format,quality,size,link}
      },
      getVideoBuffer(buffer){
        return Buffer.from(buffer,'base64').toString()
      }
}

module.exports = helper