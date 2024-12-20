const express = require('express');
const axios = require('axios');
const router = express.Router();

// 아두이노 서버 정보
const ARDUINO_IP = '192.168.219.180'; // 아두이노 IP 주소
const ARDUINO_PORT = 3001;           // 아두이노 HTTP 서버 포트

// 급수기 상태 변수
const MAX_WATER_CAPACITY = 100; // 급수기의 최대 물량 (리터)
let currentWaterLevel = MAX_WATER_CAPACITY; // 현재 물량

// 급수 요청 (POST /water/supply)
router.post('/supply', async (req, res) => {
  const { amount } = req.body;

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: '유효한 급수량(amount)을 입력해주세요.' });
  }

  if (amount > currentWaterLevel) {
    return res.status(400).json({ error: '남은 물량이 부족합니다.' });
  }

  try {
    // 아두이노로 급수 요청
    const response = await axios.post(`http://${ARDUINO_IP}:${ARDUINO_PORT}/supply`, { amount });
    currentWaterLevel -= amount; // 로컬 상태 업데이트
    res.json({
      message: '급수가 완료되었습니다.',
      supplied: amount,
      remaining: currentWaterLevel,
      unit: 'liters',
      ...response.data,
    });
  } catch (error) {
    console.error('급수 요청 오류:', error.message);
    res.status(500).json({ error: '급수 요청에 실패했습니다.' });
  }
});

// 물 채우기 (POST /water/refill)
router.post('/refill', async (req, res) => {
  try {
    // 아두이노로 물 채우기 요청
    const response = await axios.post(`http://${ARDUINO_IP}:${ARDUINO_PORT}/refill`);
    currentWaterLevel = MAX_WATER_CAPACITY; // 로컬 상태 업데이트
    res.json({
      message: '급수기가 다시 채워졌습니다.',
      remaining: currentWaterLevel,
      unit: 'liters',
      ...response.data,
    });
  } catch (error) {
    console.error('물 채우기 오류:', error.message);
    res.status(500).json({ error: '물 채우기 요청에 실패했습니다.' });
  }
});

// 급수기 상태 조회 (GET /water/status)
router.get('/status', async (req, res) => {
  try {
    // 아두이노로 상태 조회 요청
    const response = await axios.get(`http://${ARDUINO_IP}:${ARDUINO_PORT}/status`);
    res.json({
      currentWaterLevel,
      maxWaterCapacity: MAX_WATER_CAPACITY,
      unit: 'liters',
      arduinoStatus: response.data,
    });
  } catch (error) {
    console.error('상태 조회 오류:', error.message);
    res.status(500).json({ error: '상태 조회 요청에 실패했습니다.' });
  }
});

// 급수기 초기화 (POST /water/reset)
router.post('/reset', async (req, res) => {
  try {
    // 아두이노로 초기화 요청
    const response = await axios.post(`http://${ARDUINO_IP}:${ARDUINO_PORT}/reset`);
    currentWaterLevel = 0; // 로컬 상태 초기화
    res.json({
      message: '급수기 상태가 초기화되었습니다.',
      remaining: currentWaterLevel,
      unit: 'liters',
      ...response.data,
    });
  } catch (error) {
    console.error('초기화 요청 오류:', error.message);
    res.status(500).json({ error: '초기화 요청에 실패했습니다.' });
  }
});

module.exports = router;
