let localAiModulePromise = null;

async function loadLocalAiModule() {
  if (!localAiModulePromise) {
    localAiModulePromise = import('./localAi');
  }

  return localAiModulePromise;
}

export async function initLocalAiClient(onProgress) {
  const module = await loadLocalAiModule();
  return module.initLocalAi(onProgress);
}

export async function askLocalAiClient(studentName, avg, prediction, isChat = false, grades = []) {
  const module = await loadLocalAiModule();
  return module.askLocalAi(studentName, avg, prediction, isChat, grades);
}
