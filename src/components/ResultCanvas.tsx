import React, { useEffect, useState } from 'react';

interface ResultCanvasProps {
	className?: string;
  urlPallet?: string;
  urlTarget?: string;
}

const ResultCanvas: React.FC<ResultCanvasProps> = (props: ResultCanvasProps) => {
	const [palletImageWidth, setPalletImageWidth] = useState<number>(0);
	const [palletImageHeight, setPalletImageHeight] = useState<number>(0);
	const [targetImageWidth, setTargetImageWidth] = useState<number>(0);
	const [targetImageHeight, setTargetImageHeight] = useState<number>(0);
  const [largestWidth, setLargestWidth] = useState<number>(0);
  const [largestHeight, setLargestHeight] = useState<number>(0);

  useEffect(() => {
    renderResultImage(
      props.urlPallet || '',
      props.urlTarget || '',
    );
  })

  function createImage(url: string) {
    const image = new Image();
    image.crossOrigin = ""
    image.src = url;
    return image;
  }

  function createTexture(gl: WebGLRenderingContext, activeTexture: number) {
    const texture = gl.createTexture();
    gl.activeTexture(activeTexture);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    return texture;
  }

  function buildRenderingTextureFn(
    gl: WebGLRenderingContext,
    image: HTMLImageElement,
    texture: WebGLTexture,
    setWidth: Function,
    setHeight: Function,
  ) {
    return () => {
      setWidth(image.width);
      setHeight(image.height);
      setLargestWidth(image.width > largestWidth ? image.width : largestWidth);
      setLargestHeight(image.height > largestHeight ? image.height : largestHeight);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
  }
	
  function createShader(gl: WebGLRenderingContext, type: GLenum, shaderSource: string) {
    const shader = gl.createShader(type);
    if (!shader) {
      throw new Error('Shader does not exist');
    }
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
      console.warn(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
    }

    return shader
  }

  function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
    const program = gl.createProgram();
    if (!program) {
      throw new Error('Program is null');
    }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
      gl.deleteProgram(program);
    }

    return program;
  }

  function renderResultCanvas(canvasId: string, url: string, url2: string, vertexShaderSource: string, fragmentShaderSource: string, debug?: boolean) {
    const canvas = document.querySelector(`#${canvasId}`);
    if (!canvas) {
      throw new Error('Canvas is null');
    }
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error('Element is not HTMLCanvasElement');
    }
    const options = debug ? { preserveDrawingBuffer: true } : undefined;
    const gl = canvas.getContext("webgl", options) as WebGLRenderingContext;
    if (!gl) {
      throw new Error('WebGL context is null');
    }

    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);
    const positionAttributeLocation = gl.getAttribLocation(program, "position");
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.useProgram(program);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, -1, 1, 1, -1, 1, 1, 1, -1, -1, 1]),
      gl.STATIC_DRAW
    );
    const palletImage = createImage(url);
    const palletTexture = createTexture(gl, gl.TEXTURE0);
    const targetImage = createImage(url2);
    const targetTexture = createTexture(gl, gl.TEXTURE1);

    if (!palletTexture) {
      throw new Error('Texture is null');
    }
    if (!targetTexture) {
      throw new Error('Texture is null');
    }

    const u_image0Location = gl.getUniformLocation(program, 'u_image0');
    const u_image1Location = gl.getUniformLocation(program, 'u_image1');
    gl.uniform1i(u_image0Location, 0);
    gl.uniform1i(u_image1Location, 1);

    palletImage.onload = buildRenderingTextureFn(gl, palletImage, palletTexture, setPalletImageWidth, setPalletImageHeight);
    targetImage.onload = buildRenderingTextureFn(gl, targetImage, targetTexture, setTargetImageWidth, setTargetImageHeight);
  }

  function renderResultImage(palletImageUrl: string, targetImageUrl: string) {
    const vertexShader = `
      attribute vec2 position;
      varying vec2 v_coord;

      void main() {
        gl_Position = vec4(position, 0, 1);
        v_coord = gl_Position.xy * 0.5 + 0.5;
      }
    `

    const fragmentShader = `
    precision mediump float;
    varying vec2 v_coord;
    uniform sampler2D u_image0;
    uniform sampler2D u_image1;

    vec3 rgb2lms(vec3 color) {
      return vec3(
        color.r * 0.3811 + color.g * 0.5783 + color.b * 0.0402,
        color.r * 0.1967 + color.g * 0.7244 + color.b * 0.0782,
        color.r * 0.0241 + color.g * 0.1288 + color.b * 0.8444
      );
    }

    vec3 lms2lab(vec3 color) {
      return vec3(
        color.x/sqrt(3.0) + color.y/sqrt(3.0) + color.z/sqrt(3.0),
        color.x/sqrt(6.0) + color.y/sqrt(6.0) - 2.0 * color.z/sqrt(6.0),
        color.x/sqrt(2.0) - color.y/sqrt(2.0)
      );
    }

    vec3 lab2lms(vec3 color) {
      return vec3(
        color.x/sqrt(3.0) + color.y/sqrt(6.0) + color.z/sqrt(2.0),
        color.x/sqrt(3.0) + color.y/sqrt(6.0) - color.z/sqrt(2.0),
        color.x/sqrt(3.0) - 2.0 * color.y/sqrt(6.0)
      );
    }

    vec3 lms2rgb(vec3 color) {
      return vec3(
        color.x * 4.4679 - color.y * 3.5873 + color.z * 0.1193,
        color.x * -1.2186 + color.y * 2.3809 - color.z * 0.1624,
        color.x * 0.0497 - color.y * 0.2439 + color.z * 1.2045
      );
    }

    void main() {
      vec4 sourceColor = texture2D(u_image0, vec2(v_coord.x, 1.0 - v_coord.y));
      vec4 targetColor = texture2D(u_image1, vec2(v_coord.x, 1.0 - v_coord.y));
      vec3 sourceColorLms = rgb2lms(vec3(sourceColor));
      vec3 targetColorLms = rgb2lms(vec3(targetColor));
      vec3 sourceColorLab = lms2lab(vec3(sourceColorLms));
      vec3 targetColorLab = lms2lab(vec3(targetColorLms));

      vec2 size = vec2(${largestWidth}, ${largestHeight});
      float sourceTotalL = 0.0;
      float sourceTotalA = 0.0;
      float sourceTotalB = 0.0;
      float targetTotalL = 0.0;
      float targetTotalA = 0.0;
      float targetTotalB = 0.0;

      for (float i = 0.0; i < ${largestWidth}.0; ++i) {
        for (float j = 0.0; j < ${largestHeight}.0; ++j) {
          if (i <= ${palletImageWidth}.0 && j <= ${palletImageHeight}.0) {
            vec4 colorPixelSource = texture2D(u_image0, vec2(i / ${palletImageWidth}.0, j / ${palletImageHeight}.0));
            vec3 labSource = lms2lab(rgb2lms(vec3(colorPixelSource)));
            sourceTotalL += labSource.x;
            sourceTotalA += labSource.y;
            sourceTotalB += labSource.z;
          }
        }
      }
      float totalSize = size.x * size.y;
      float sourceMeanL = sourceTotalL / totalSize;
      float sourceMeanA = sourceTotalA / totalSize;
      float sourceMeanB = sourceTotalB / totalSize;
      float targetMeanL = targetTotalL / totalSize;
      float targetMeanA = targetTotalA / totalSize;
      float targetMeanB = targetTotalB / totalSize;

      sourceTotalL = 0.0;
      sourceTotalA = 0.0;
      sourceTotalB = 0.0;
      targetTotalL = 0.0;
      targetTotalA = 0.0;
      targetTotalB = 0.0;

      float sourceVarianceL = 0.0;
      float sourceVarianceA = 0.0;
      float sourceVarianceB = 0.0;
      float targetVarianceL = 0.0;
      float targetVarianceA = 0.0;
      float targetVarianceB = 0.0;
      for (float i = 0.0; i < ${largestWidth}.0; ++i) {
        for (float j = 0.0; j < ${largestHeight}.0; ++j) {
          if (i <= ${palletImageWidth}.0 && j <= ${palletImageHeight}.0) {
            vec4 colorPixelSource = texture2D(u_image0, vec2(i / ${palletImageWidth}.0, j / ${palletImageHeight}.0));
            vec3 labSource = lms2lab(rgb2lms(vec3(colorPixelSource)));
            sourceVarianceL += (labSource.x - sourceMeanL)*(labSource.x - sourceMeanL);
            sourceVarianceA += (labSource.y - sourceMeanA)*(labSource.y - sourceMeanA);
            sourceVarianceB += (labSource.z - sourceMeanB)*(labSource.z - sourceMeanB);
          }
          if (i <= ${targetImageWidth}.0 && j <= ${targetImageHeight}.0) {
            vec4 colorPixelTarget = texture2D(u_image1, vec2(i / ${targetImageWidth}.0, j / ${targetImageHeight}.0));
            vec3 labTarget = lms2lab(rgb2lms(vec3(colorPixelTarget)));
            targetVarianceL += (labTarget.x - targetMeanL)*(labTarget.x - targetMeanL);
            targetVarianceA += (labTarget.y - targetMeanL)*(labTarget.y - targetMeanL);
            targetVarianceB += (labTarget.z - targetMeanL)*(labTarget.z - targetMeanL);
          }
        }
      }
      sourceVarianceL = sourceVarianceL / totalSize;
      sourceVarianceA = sourceVarianceA / totalSize;
      sourceVarianceB = sourceVarianceB / totalSize;
      targetVarianceL = targetVarianceL / totalSize;
      targetVarianceA = targetVarianceA / totalSize;
      targetVarianceB = targetVarianceB / totalSize;

      float sourceStandardDeviationL = sqrt(sourceVarianceL);
      float sourceStandardDeviationA = sqrt(sourceVarianceA);
      float sourceStandardDeviationB = sqrt(sourceVarianceB);
      float targetStandardDeviationL = sqrt(targetVarianceL);
      float targetStandardDeviationA = sqrt(targetVarianceA);
      float targetStandardDeviationB = sqrt(targetVarianceB);

      float l = targetColorLab.x - targetMeanL;
      float a = targetColorLab.y - targetMeanA;
      float b = targetColorLab.z - targetMeanB;

      l *= sourceStandardDeviationL / targetStandardDeviationL;
      a *= sourceStandardDeviationA / targetStandardDeviationA;
      b *= sourceStandardDeviationB / targetStandardDeviationB;

      l += sourceMeanL;
      a += sourceMeanA;
      b += sourceMeanB;

      l = l < 0.0 ? 0.0 : l;
      a = a < 0.0 ? 0.0 : a;
      b = b < 0.0 ? 0.0 : b;
      l = l > 255.0 ? 255.0 : l;
      a = a > 255.0 ? 255.0 : a;
      b = b > 255.0 ? 255.0 : b;

      targetColorLab.x = l;
      targetColorLab.y = a;
      targetColorLab.z = b;
      vec3 outputColor = lms2rgb(lab2lms(targetColorLab));
      gl_FragColor = vec4(outputColor, 1);
    }
    `;

    renderResultCanvas(
      'result',
      palletImageUrl,
      targetImageUrl,
      vertexShader,
      fragmentShader,
      true,
    );
  }

  return <canvas id="result" className={props.className}></canvas>;
}

export default ResultCanvas;
