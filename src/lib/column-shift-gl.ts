const VERT = `
attribute vec2 a_pos;
attribute vec2 a_uv;
varying vec2 vUv;
void main() {
  vUv = a_uv;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

const FRAG = `
precision mediump float;
uniform sampler2D tMap;
uniform float uStart;
uniform float uHover;
uniform float uFocus;
uniform float uSpread;
uniform float uUvMin;
uniform float uUvMax;
uniform float uNudge;
varying vec2 vUv;

void main() {
  /* Stable 0..1 in texture — do not add uNudge here or the whole line slides. */
  float tnx = mix(uUvMin, uUvMax, vUv.x);
  float focusNorm = abs(tnx - uFocus) / max(0.0001, uSpread);
  float focusMask = 1.0 - smoothstep(0.0, 1.0, focusNorm);
  float hoverLocal = uHover * mix(0.3, 1.0, focusMask);
  float strength = hoverLocal * 1.35;
  float moder = clamp((uStart * 0.5) + strength, 0.0, 1.0);
  float cols = 16.0;
  vec2 U = vec2(tnx - (moder * 0.2), vUv.y);
  vec2 P = vec2(cols, cols);
  vec2 mouse = vec2(moder, 0.0);
  float centpos = tnx + mouse.x;
  float cent = (1.0 - tnx) - 0.5;
  cent *= 2.0;
  float otro = floor(cent * P.x) / P.x;
  U.x -= otro;
  U.x += (mouse.x * (otro * 0.28));
  U.x += (centpos * 1.35) * (mouse.x * (otro * 0.16));
  float hov = 0.14 * strength;
  U.x += otro + (otro * hov) + (strength * 0.26);
  U.x += uNudge;
  /* One sample: shape follows the warp so slices read as cut/reveal, not paint sliding in a fixed mask. */
  gl_FragColor = texture2D(tMap, U);
}
`

function compileShader(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)
  if (!sh) return null
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(sh) || 'Unknown shader compile error'
    const numbered = src
      .split('\n')
      .map((line, i) => `${i + 1}: ${line}`)
      .join('\n')
    console.error(info, '\n', numbered)
    gl.deleteShader(sh)
    return null
  }
  return sh
}

export type ColumnShiftGL = {
  gl: WebGLRenderingContext
  program: WebGLProgram
  loc: {
    a_pos: number
    a_uv: number
    tMap: WebGLUniformLocation | null
    uStart: WebGLUniformLocation | null
    uHover: WebGLUniformLocation | null
    uFocus: WebGLUniformLocation | null
    uSpread: WebGLUniformLocation | null
    uUvMin: WebGLUniformLocation | null
    uUvMax: WebGLUniformLocation | null
    uNudge: WebGLUniformLocation | null
  }
  buf: WebGLBuffer
  texture: WebGLTexture
}

export function initColumnShiftGL(
  canvas: HTMLCanvasElement
): ColumnShiftGL | null {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    premultipliedAlpha: false,
    antialias: true,
  })
  if (!gl) return null

  const vs = compileShader(gl, gl.VERTEX_SHADER, VERT)
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG)
  if (!vs || !fs) return null

  const program = gl.createProgram()
  if (!program) return null
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program))
    return null
  }

  const a_pos = gl.getAttribLocation(program, 'a_pos')
  const a_uv = gl.getAttribLocation(program, 'a_uv')

  const buf = gl.createBuffer()
  if (!buf) return null

  // two triangles, pos.xy + uv.xy interleaved
  const quad = new Float32Array([
    -1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, -1, 1, 0, 1, 1, 1, 1, -1, 1, 0,
    1,
  ])

  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW)

  const texture = gl.createTexture()
  if (!texture) return null
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

  return {
    gl,
    program,
    loc: {
      a_pos,
      a_uv,
      tMap: gl.getUniformLocation(program, 'tMap'),
      uStart: gl.getUniformLocation(program, 'uStart'),
      uHover: gl.getUniformLocation(program, 'uHover'),
      uFocus: gl.getUniformLocation(program, 'uFocus'),
      uSpread: gl.getUniformLocation(program, 'uSpread'),
      uUvMin: gl.getUniformLocation(program, 'uUvMin'),
      uUvMax: gl.getUniformLocation(program, 'uUvMax'),
      uNudge: gl.getUniformLocation(program, 'uNudge'),
    },
    buf,
    texture,
  }
}

export function uploadTextTexture(
  ctx: ColumnShiftGL,
  source: HTMLCanvasElement
) {
  const { gl, texture } = ctx
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)
}

export function drawColumnShift(
  ctx: ColumnShiftGL,
  width: number,
  height: number,
  uStart: number,
  uHover: number,
  uFocus = 0.5,
  uSpread = 0.22,
  uUvMin = 0,
  uUvMax = 1,
  uNudge = 0
) {
  const { gl, program, loc, buf } = ctx
  gl.viewport(0, 0, width, height)
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  gl.useProgram(program)
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.enableVertexAttribArray(loc.a_pos)
  gl.enableVertexAttribArray(loc.a_uv)
  gl.vertexAttribPointer(loc.a_pos, 2, gl.FLOAT, false, 16, 0)
  gl.vertexAttribPointer(loc.a_uv, 2, gl.FLOAT, false, 16, 8)

  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, ctx.texture)
  if (loc.tMap) gl.uniform1i(loc.tMap, 0)
  if (loc.uStart) gl.uniform1f(loc.uStart, uStart)
  if (loc.uHover) gl.uniform1f(loc.uHover, uHover)
  if (loc.uFocus) gl.uniform1f(loc.uFocus, uFocus)
  if (loc.uSpread) gl.uniform1f(loc.uSpread, uSpread)
  if (loc.uUvMin) gl.uniform1f(loc.uUvMin, uUvMin)
  if (loc.uUvMax) gl.uniform1f(loc.uUvMax, uUvMax)
  if (loc.uNudge) gl.uniform1f(loc.uNudge, uNudge)

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  gl.drawArrays(gl.TRIANGLES, 0, 6)
}

export function disposeColumnShiftGL(ctx: ColumnShiftGL) {
  const { gl, program, buf, texture } = ctx
  gl.deleteBuffer(buf)
  gl.deleteTexture(texture)
  gl.deleteProgram(program)
}
