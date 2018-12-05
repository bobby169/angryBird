export default {
  TOP_LEFT: 'topleft',
  TOP_CENTER: 'topcenter',
  TOP_RIGHT: 'topright',
  LEFT_TOP: 'lefttop',
  LEFT_CENTER: 'leftcenter',
  LEFT_BOTTOM: 'leftbottom',
  RIGHT_TOP: 'righttop',
  RIGHT_CENTER: 'rightcenter',
  RIGHT_BOTTOM: 'rightbottom',
  BOTTOM_LEFT: 'bottomleft',
  BOTTOM_CENTER: 'bottomcenter',
  BOTTOM_RIGHT: 'bottomright',
  TOP: 'top',
  BOTTOM: 'bottom',
  LEFT: 'left',
  RIGHT: 'right',
  CENTER: 'center',

  NONE: 'none',
  UP: 'up',
  DOWN: 'down',

  GROUP: 'group',
  SPRITE: 'sprite',
  TILEMAPLAYER: 'tilemaplayer',

  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',

  DEBUG: false,

  DEFAULT_CONFIG: {
    project: 'hb_game',
    width: 640,
    height: 1008,
    container: 'animation_container',
    fps: 60,
    showfps: false,
    backgroundColor: 'rgba(255,255,255,1)',
    response: [true, 'both', false, 1],
    resources: {
      basePath: './',
      manifest: []
    }
  },

  DEGREES: 57.2957795,
  RADIANS: 0.0174532925,
  PI2: 6.2831853071
}
