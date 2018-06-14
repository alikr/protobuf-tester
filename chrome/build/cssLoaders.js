const path = require('path');
const style_loader = [
	{
		loader: 'style-loader'
	}
];
module.exports = function(prod){
	var cssOptions = cssLoaders(prod);
	return {
		css:cssLoader(prod, cssOptions),
		less:lessLoader(prod, cssOptions),
		vue:vueLoader(prod, cssOptions),
	}
}
function cssLoaders(prod){
	return [
		{
			loader:'css-loader'
		},
		{
      loader: 'postcss-loader',
      options: {
        config: {
        	path: path.join(__dirname, './postcss.config.js')
        }
      }
    }
	];
}

function cssLoader(prod, cssOptions){
	return style_loader.concat(cssOptions);
}

function vueLoader(prod, cssOptions){
	return ['vue-style-loader'].concat(cssOptions)
}

function lessLoader(prod, cssOptions){
	var less = {
  	loader: "less-loader"
  }
	return style_loader.concat(cssOptions).concat([less])
}