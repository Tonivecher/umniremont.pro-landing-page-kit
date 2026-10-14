#!/bin/bash
set -euo pipefail

echo "=================================================="
echo " Настройка токена Telegram-бота @umniyremontbot"
echo "=================================================="
echo ""
read -s -p "Вставьте токен бота от @BotFather: " token
echo ""

if [[ -z "$token" ]]; then
    echo "Ошибка: токен пустой."
    exit 1
fi

echo "Проверяем токен через Telegram API..."
check=$(curl -s "https://api.telegram.org/bot${token}/getMe")

if echo "$check" | grep -q '"ok":true'; then
    bot_username=$(echo "$check" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
    echo "Токен верный! Бот: @$bot_username"
else
    echo "Ошибка! Telegram API вернул: $check"
    echo "Проверьте правильность токена и попробуйте снова."
    exit 1
fi

sed -i "s|^TELEGRAM_TOKEN=.*|TELEGRAM_TOKEN=${token}|" /etc/umniy-remont-bot.env

systemctl enable umniy-remont-bot.service
systemctl restart umniy-remont-bot.service

echo ""
echo "Служба umniy-remont-bot.service успешно запущена!"
sleep 2
systemctl status umniy-remont-bot.service --no-pager
