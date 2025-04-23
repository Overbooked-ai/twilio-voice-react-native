package com.twiliovoicereactnative;

import android.content.Context;
import android.media.AudioAttributes;
import android.media.SoundPool;
import android.media.MediaPlayer;

import java.util.HashMap;
import java.util.Map;

public class MediaPlayerManager {
  public enum SoundTable {
    INCOMING,
    OUTGOING,
    DISCONNECT,
    RINGTONE
  }
  private final SoundPool soundPool;
  private final Map<SoundTable, Integer> soundMap;
  private int activeStream;
  private final Context context;
  private MediaPlayer mediaPlayer;

  public MediaPlayerManager(Context context) {
    this.context = context;
    soundPool = (new SoundPool.Builder())
      .setMaxStreams(2)
      .setAudioAttributes(
        new AudioAttributes.Builder()
          .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
          .setUsage(AudioAttributes.USAGE_VOICE_COMMUNICATION)
          .build())
      .build();
    activeStream = 0;
    soundMap = new HashMap<>();
    soundMap.put(SoundTable.INCOMING, soundPool.load(context, R.raw.incoming, 1));
    soundMap.put(SoundTable.OUTGOING, soundPool.load(context, R.raw.outgoing, 1));
    soundMap.put(SoundTable.DISCONNECT, soundPool.load(context, R.raw.disconnect, 1));
    soundMap.put(SoundTable.RINGTONE, soundPool.load(context, R.raw.ringtone, 1));
  }

  public void play(final SoundTable sound) {
    activeStream = soundPool.play(
      soundMap.get(sound),
      1.f,
      1.f,
      1,
      (SoundTable.DISCONNECT== sound) ? 0 : -1,
      1.f);
  }

  public void stop() {
    soundPool.stop(activeStream);
    activeStream = 0;
  }

  public void start() {
    if (mediaPlayer != null && !mediaPlayer.isPlaying()) {
      mediaPlayer.start();
    }
  }

  public void release() {
    if (mediaPlayer != null) {
      mediaPlayer.release();
      mediaPlayer = null;
    }
  }

  @Override
  protected void finalize() throws Throwable {
    soundPool.release();
    super.finalize();
  }
}
