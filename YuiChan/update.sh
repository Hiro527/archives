#! /bin/bash
echo '最新のデータに更新しています…'
git fetch && git pull
echo 'サービスを再起動しています…'
sudo systemctl restart yuichan