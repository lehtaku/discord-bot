process.kill(process.pid)
    .catch((error) => {
        console.log(error);
    });