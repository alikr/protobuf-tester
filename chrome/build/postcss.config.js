const autoprefixer = require('autoprefixer');
const fix = autoprefixer({
	browsers: ['last 2 version', '> 5%', 'ie >= 9', 'Firefox > 20']
})
module.exports = {
  plugins: [
    fix
  ]
}