'use client'

import { jsx as _jsx } from 'react/jsx-runtime'
import { useEffect, useRef } from 'react'
import { Renderer, Program, Mesh, Triangle } from 'ogl'

interface FloatingAnimationProps {
  colorStops?: string[]
  amplitude?: number
  blend?: number
  speed?: number
  height?: string
  className?: string
}

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ),
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

struct ColorStop {
  vec3 color;
  float position;
};

#define COLOR_RAMP(colors, factor, finalColor) {              \\
  int index = 0;                                            \\
  for (int i = 0; i < 2; i++) {                               \\
     ColorStop currentColor = colors[i];                    \\
     bool isInBetween = currentColor.position <= factor;    \\
     index = int(mix(float(index), float(i), float(isInBetween))); \\
  }                                                         \\
  ColorStop currentColor = colors[index];                   \\
  ColorStop nextColor = colors[index + 1];                  \\
  float range = nextColor.position - currentColor.position; \\
  float lerpFactor = (factor - currentColor.position) / range; \\
  finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \\
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  ColorStop colors[3];
  colors[0] = ColorStop(uColorStops[0], 0.0);
  colors[1] = ColorStop(uColorStops[1], 0.5);
  colors[2] = ColorStop(uColorStops[2], 1.0);

  vec3 rampColor;
  COLOR_RAMP(colors, uv.x, rampColor);

  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height = exp(height);
  height = (uv.y * 2.0 - height + 0.2);
  float intensity = 0.6 * height;

  float midPoint = 0.20;
  float animationAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);

  vec3 finalColor = rampColor;

  fragColor = vec4(finalColor * animationAlpha, animationAlpha);
}
`

function parseColor(color: string): [number, number, number] {
  const hex = color.trim().replace('#', '')
  const full =
    hex.length === 3
      ? hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
      : hex
  return [
    parseInt(full.substring(0, 2), 16) / 255,
    parseInt(full.substring(2, 4), 16) / 255,
    parseInt(full.substring(4, 6), 16) / 255,
  ]
}

export default function FloatingAnimation({
  colorStops = ['#764105', '#1818E7', '#FF299B'],
  amplitude = 1,
  blend = 0.5,
  speed = 1,
  height = '100%',
  className = '',
}: FloatingAnimationProps) {
  const propsRef = useRef({ colorStops, amplitude, blend, speed })
  propsRef.current = { colorStops, amplitude, blend, speed }

  const ctnDom = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctn = ctnDom.current
    if (!ctn) return

    const renderer = new Renderer({
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
    })
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    gl.canvas.style.width = '100%'
    gl.canvas.style.height = '100%'
    gl.canvas.style.display = 'block'
    gl.canvas.style.backgroundColor = 'transparent'

    const geometry = new Triangle(gl)
    if ((geometry.attributes as Record<string, unknown>).uv) {
      delete (geometry.attributes as Record<string, unknown>).uv
    }

    const colorStopsArray = (colorStops || []).map((c) => parseColor(c))

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: amplitude },
        uColorStops: { value: colorStopsArray },
        uResolution: { value: [ctn.offsetWidth, ctn.offsetHeight] },
        uBlend: { value: blend },
      },
    })

    const mesh = new Mesh(gl, { geometry, program })
    ctn.appendChild(gl.canvas)

    function resize() {
      if (!ctn) return
      const width = ctn.offsetWidth
      const h = ctn.offsetHeight
      renderer.setSize(width, h)
      if (program) {
        program.uniforms.uResolution.value = [width, h]
        const baseHeight = 800
        const scaleFactor = baseHeight / (h || 1)
        const baseAmp = propsRef.current.amplitude ?? amplitude
        program.uniforms.uAmplitude.value = baseAmp * scaleFactor
      }
      renderer.render({ scene: mesh })
    }

    const resizeObserver = new ResizeObserver(() => resize())
    resizeObserver.observe(ctn)
    resize()

    let animateId = 0
    const update = (t: number) => {
      animateId = requestAnimationFrame(update)
      const current = propsRef.current
      const time = t * 0.001 * (current.speed ?? speed)

      if (program && ctn) {
        program.uniforms.uTime.value = time
        const baseHeight = 800
        const scaleFactor = baseHeight / (ctn.offsetHeight || 1)
        const baseAmp = current.amplitude ?? amplitude
        program.uniforms.uAmplitude.value = baseAmp * scaleFactor
        program.uniforms.uBlend.value = current.blend ?? blend

        const stops = current.colorStops || colorStops
        if (stops && Array.isArray(stops) && stops.length >= 3) {
          program.uniforms.uColorStops.value = stops.map((c) => parseColor(c))
        }
        renderer.render({ scene: mesh })
      }
    }

    animateId = requestAnimationFrame(update)

    return () => {
      cancelAnimationFrame(animateId)
      resizeObserver.disconnect()
      if (ctn && gl.canvas.parentNode === ctn) {
        ctn.removeChild(gl.canvas)
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [])

  return (
    <div
      ref={ctnDom}
      className={className}
      style={{
        width: '100%',
        height,
        overflow: 'hidden',
        background: 'transparent',
      }}
    />
  )
}
