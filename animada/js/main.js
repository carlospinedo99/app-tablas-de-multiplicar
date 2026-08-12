import { initApp } from '../../shared/js/app-core.js';
import { renderCharacter } from './personajes/index.js';

initApp({ theme: 'animada', characterRenderer: renderCharacter });
