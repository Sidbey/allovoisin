var validator = require('validator');

console.log(validator.isAlpha('Léo'));
console.log(validator.isAlpha('Léo', 'fr-FR'));