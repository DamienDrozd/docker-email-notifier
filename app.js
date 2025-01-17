const {Seq} = require('immutable');
const Docker = require('dockerode');
const MailClient = require('./mail');
const JSONStream = require('JSONStream');
const templates = require('./templates');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec)
// const spawn = promisify(require('child_process').spawn);


const imageRegExp = new RegExp(process.env.image_regexp);
const docker = new Docker();
const mail = new MailClient();


async function getLogs(id) {
  // Exec output contains both stderr and stdout outputs
  // const logs = await spawn("docker logs " + id)
  const logs = await exec("docker logs " + id + " --since 1h",{maxBuffer: 1024 * 500})



  console.log(logs.stdout.trim())

  // return logs.stdout.trim()
  return logs.stdout.trim()
  
}


async function sendEvent(event) {
  console.log();
  console.info(event);
  if (event.Type === 'container' && (event.Action === 'die' || event.Action === 'kill')) {
    console.log()
    const logs = await getLogs(event.Actor.ID)
    console.log("logs : ", logs)
    console.log()

    event.logs = logs
  }
  
  if (imageRegExp.test(event.from)) {
    const template = templates[`${event.Type}_${event.Action}`];
    if (template) {
      const attachment = template(event);
      await mail.send(attachment, event.Actor.Attributes.image)
    }
  }
}

async function sendEventStream() {
  const eventStream = await docker.getEvents();
  eventStream.pipe(JSONStream.parse())
    .on('data', event => sendEvent(event).catch(handleError))
    .on('error', handleError);
}

async function sendVersion() {
  const version = await docker.version();
  const text = 'Docker email notifier started';
  Seq(version).map((value, title) => text += `${title}: <b>${value}</b>`);
  mail.send(text, "docker running");
}

async function main() {
  await sendVersion();
  await sendEventStream();
}

function handleError(e) {
  console.error(e);
  mail.sendError(e).catch(console.error);
}

main().catch(handleError);
