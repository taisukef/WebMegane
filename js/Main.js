(function() {
	// 一辺の長さ
	var STEP = 100;

	// シーン
	var scene;
	// カメラ
	var camera;
	// レンダラー
	var renderer;
	// 描画領域
	var container;
	// VR表示へ変換
	var effect;
	// DOM
	var element;
	// 操作
	var controls;
	// 時間
	var clock;
	// 立方体の輪郭線を格納する配列
	var edgesPool;

	/**
	 * Initialize
	 */
	function init() {
		// シーン
		scene = new THREE.Scene();

		// カメラ
		camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 3000);
		camera.position.set(0, 700, 0);
		scene.add(camera);

		// レンダラー
		renderer = new THREE.WebGLRenderer({antialias: true});
		renderer.setClearColor(0x0);
		renderer.setSize(window.innerWidth, window.innerHeight);

		// ピクセルレートを設定
		if(window.devicePixelRatio) {
			renderer.setPixelRatio(window.devicePixelRatio);
		}

		// DOM
		element = renderer.domElement;

		// 描画領域
		container = document.getElementById("container");
		container.appendChild(element);

		// VR表示へ変換
		effect = new THREE.StereoEffect(renderer);

		// PCで閲覧時にマウスドラッグで操作
		controls = new THREE.OrbitControls(camera, element);
		controls.rotateUp(Math.PI / 4);
		controls.target.set(
			camera.position.x + 0.15,
			camera.position.y,
			camera.position.z
		);
		controls.noZoom = true;
		controls.noPan = true;

		clock = new THREE.Clock();

		// スマートフォンの場合はジャイロセンサーでの操作へ変更
		window.addEventListener("deviceorientation", setOrientationControls, true);

		// windowのリサイズ処理
		window.addEventListener("resize", resize, false);
		resize();

		// 立方体を生成
		createBox();

		// 床を生成
		createBrid();

		// 繰り返し処理を開始
		loop();
	}

	/**
	 * ジャイロセンサーでの操作へ変更します。
	 */
	function setOrientationControls(e) {
		if (!e.alpha) {
			return;
		}

		controls = new THREE.DeviceOrientationControls(camera, true);
		controls.connect();
		controls.update();

		element.addEventListener("click", fullscreen, false);

		window.removeEventListener("deviceorientation", setOrientationControls, true);
	}

	/**
	 * 立方体の生成します。
	 */
	function createBox() {
		edgesPool = [];

		var geometry = new THREE.BoxGeometry(STEP, STEP, STEP, 1, 1, 1);
		var material = new THREE.MeshBasicMaterial({ color: 0xFF0000 });

		for(var i = 0; i < 700; i++) {
			var mesh = new THREE.Mesh(geometry, material);
			// 立方体を作る
			var egh = new THREE.EdgesHelper(mesh, 0xFF0000);
			egh.material.linewidth = 1;
			egh.updateMatrix();
			scene.add(egh);

			edgesPool.push(egh);

			startDrop(egh);
		}
	}

	/**
	 * 落下アニメーションを停止します。
	 */
	function startDrop(egh) {
		// ランダムに立方体を配置
		egh.position.x = STEP * Math.round(6000 * (Math.random() - 0.5) / STEP) + STEP / 2;
		egh.position.y = 5000;
		egh.position.z = STEP * Math.round(6000 * (Math.random() - 0.5) / STEP) + STEP / 2;
		egh.updateMatrix();

		// 秒数
		var sec = 3 * Math.random() + 3;

		TweenMax.to(egh.position, sec, {
			y: STEP / 2 + 10,
			ease: Bounce.easeOut,
			onComplete: endDrop,
			onCompleteParams: [egh]
		});
	}

	/**
	 * 落下アニメーションが終了しました。
	 */
	function endDrop(egh) {
		// 再度アニメーション
		setTimeout(function() {
			startDrop(egh)
		}, 1000);
	}

	/**
	 * 地面を生成します。
	 */
	function createBrid() {
		var grid = new THREE.GridHelper(10000, STEP);
		grid.setColors(0x444444, 0x444444);
		scene.add(grid);
	}

	/**
	 * windowがリサイズしました。
	 */
	function resize() {
		var width = container.offsetWidth;
		var height = container.offsetHeight;

		camera.aspect = width / height;
		camera.updateProjectionMatrix();

		renderer.setSize(width, height);
		effect.setSize(width, height);
	}

	/**
	 * 繰り返し実行される処理です。
	 */
	function loop() {
		requestAnimationFrame(loop);

		update(clock.getDelta());
		render();
	}

	/**
	 * 更新します。
	 */
	function update(dt) {
		if(edgesPool) {
			for (var i = 0; i < edgesPool.length; i++) {
				edgesPool[i].updateMatrix();
			}
		}

		camera.updateProjectionMatrix();

		controls.update(dt);
	}

	/**
	 * レンダリングします。
	 */
	function render() {
		effect.render(scene, camera);
	}

	/**
	 * フルスクリーン表示へ切り替えます。
	 */
	function fullscreen() {
		if (container.requestFullscreen) {
			container.requestFullscreen();
		} else if (container.msRequestFullscreen) {
			container.msRequestFullscreen();
		} else if (container.mozRequestFullScreen) {
			container.mozRequestFullScreen();
		} else if (container.webkitRequestFullscreen) {
			container.webkitRequestFullscreen();
		}
	}

	window.addEventListener("DOMContentLoaded", init, false);
})();