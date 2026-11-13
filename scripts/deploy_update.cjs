const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const conn = new Client();
const archivePath = path.resolve(__dirname, '../dist_update.tar.gz');
const apiServerPath = path.resolve(__dirname, 'api_server.py');

conn.on('ready', () => {
  console.log('SSH connection established');
  conn.sftp((err, sftp) => {
    if (err) {
      console.error('SFTP error:', err);
      conn.end();
      process.exit(1);
    }

    console.log('Uploading dist_update.tar.gz and api_server.py...');
    
    // Upload dist archive
    const readArchive = fs.createReadStream(archivePath);
    const writeArchive = sftp.createWriteStream('/tmp/dist_update.tar.gz');

    writeArchive.on('close', () => {
      console.log('Frontend archive uploaded.');
      
      // Upload api_server.py
      const readApi = fs.createReadStream(apiServerPath);
      const writeApi = sftp.createWriteStream('/tmp/api_server.py');

      writeApi.on('close', () => {
        console.log('api_server.py uploaded. Executing deploy and restart...');
        
        const cmd = [
          'echo admin | sudo -S tar -xzf /tmp/dist_update.tar.gz -C /var/www/brazil-travels',
          'echo admin | sudo -S cp /tmp/api_server.py /home/pi/api_server.py',
          'echo admin | sudo -S cp /tmp/api_server.py /var/www/brazil-travels/api_server.py',
          'echo admin | sudo -S chmod +x /home/pi/api_server.py /var/www/brazil-travels/api_server.py',
          'echo admin | sudo -S chown pi:pi /home/pi/api_server.py',
          'echo admin | sudo -S mkdir -p /var/www/brazil-travels/uploads /var/www/brazil-travels/data',
          'echo admin | sudo -S chown -R www-data:www-data /var/www/brazil-travels',
          'echo admin | sudo -S chmod -R 777 /var/www/brazil-travels/uploads /var/www/brazil-travels/data',
          'echo admin | sudo -S systemctl restart brazil-travels-api.service',
          'export DISPLAY=:0 && /home/pi/reload.sh'
        ].join(' && ');

        conn.exec(cmd, (execErr, stream) => {
          if (execErr) {
            console.error('Exec error:', execErr);
            conn.end();
            process.exit(1);
          }

          stream.on('close', (code, signal) => {
            console.log(`Deploy command finished with code ${code}`);
            conn.end();
          }).on('data', (data) => {
            console.log('STDOUT:', data.toString().trim());
          }).stderr.on('data', (data) => {
            console.error('STDERR:', data.toString().trim());
          });
        });
      });

      readApi.pipe(writeApi);
    });

    readArchive.pipe(writeArchive);
  });
}).on('error', (err) => {
  console.error('Connection error:', err);
  process.exit(1);
}).connect({
  host: '192.168.1.16',
  port: 22,
  username: 'pi',
  password: 'admin'
});
