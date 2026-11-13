const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const conn = new Client();
const archivePath = path.resolve(__dirname, '../dist_update.tar.gz');

conn.on('ready', () => {
  console.log('SSH connection established');
  conn.sftp((err, sftp) => {
    if (err) {
      console.error('SFTP error:', err);
      conn.end();
      process.exit(1);
    }

    console.log('Uploading dist_update.tar.gz...');
    const readStream = fs.createReadStream(archivePath);
    const writeStream = sftp.createWriteStream('/tmp/dist_update.tar.gz');

    writeStream.on('close', () => {
      console.log('Upload complete. Extracting and reloading kiosk...');
      const cmd = 'echo admin | sudo -S tar -xzf /tmp/dist_update.tar.gz -C /var/www/brazil-travels && echo admin | sudo -S chown -R www-data:www-data /var/www/brazil-travels && export DISPLAY=:0 && /home/pi/reload.sh';
      
      conn.exec(cmd, (execErr, stream) => {
        if (execErr) {
          console.error('Exec error:', execErr);
          conn.end();
          process.exit(1);
        }

        stream.on('close', (code, signal) => {
          console.log(`Command closed with code ${code}`);
          conn.end();
        }).on('data', (data) => {
          console.log('STDOUT:', data.toString());
        }).stderr.on('data', (data) => {
          console.error('STDERR:', data.toString());
        });
      });
    });

    readStream.pipe(writeStream);
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
