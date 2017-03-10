let languageAssets = Assets.getText('languages.csv').split(/\r\n|\n/);
console.info('updating languages: ' + languageAssets.length);
languageAssets.forEach(function(entry) {
  if (entry) {
    let fields = entry.split(',');
    // Languages.upsert({
    //   _id: fields[3]
    // }, {native: fields[2]});
  }
});
