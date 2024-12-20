const express = require('express');
const axios = require('axios');
const router = express.Router();

// 아두이노 서버 정보
const ARDUINO_IP = '192.168.219.180'; // 아두이노 IP 주소
const ARDUINO_PORT = 3001;           // 아두이노 HTTP 서버 포트

// 수위 설정 상태
let waterLevelThreshold = 500; // 초기 수위 설정값 (아날로그 센서 기준)

// 수위 설정 (POST /water/threshold)
router.post('/threshold', async (req, res) => {
  const { threshold } = req.body;

  if (!threshold || typeof threshold !== 'number' || threshold <= 0 || threshold > 1023) {
    return res.status(400).json({ error: '유효한 수위 설정 값(threshold)을 입력해주세요. (1 ~ 1023)' });
  }

  try {
    // 아두이노로 수위 설정 값 전달
    const response = await axios.post(`http://${ARDUINO_IP}:${ARDUINO_PORT}/set-threshold`, { threshold });

    // 로컬 상태 업데이트
    waterLevelThreshold = threshold;

    res.json({
      message: '수위 설정 값이 업데이트되었습니다.',
      newThreshold: waterLevelThreshold,
      arduinoResponse: response.data,
    });
  } catch (error) {
    console.error('수위 설정 요청 오류:', error.message);
    res.status(500).json({ error: '수위 설정 요청에 실패했습니다.' });
  }
});

// 현재 수위 설정 조회 (GET /water/threshold)
router.get('/threshold', async (req, res) => {
  try {
    res.json({
      message: '현재 수위 설정 값입니다.',
      currentThreshold: waterLevelThreshold,
    });
  } catch (error) {
    console.error('수위 설정 조회 오류:', error.message);
    res.status(500).json({ error: '수위 설정 조회에 실패했습니다.' });
  }
});

// 현재 상태 조회 (GET /water/status)
router.get('/status', async (req, res) => {
  try {
    // 아두이노로 상태 조회 요청
    const response = await axios.get(`http://${ARDUINO_IP}:${ARDUINO_PORT}/status`);
    res.json({
      currentWaterLevel: response.data.currentWaterLevel,
      threshold: waterLevelThreshold,
      unit: 'liters',
      arduinoStatus: response.data,
    });
  } catch (error) {
    console.error('상태 조회 오류:', error.message);
    res.status(500).json({ error: '상태 조회 요청에 실패했습니다.' });
  }
});

module.exports = router;
