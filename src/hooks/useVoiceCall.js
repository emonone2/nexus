import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// =====================================================
// BROWSER NOTIFICATION
// =====================================================

const requestBrowserNotification = async () => {
  if (!('Notification' in window)) {
    console.warn(
      'Browser notifications are not supported.'
    );

    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.warn(
      'Browser notification permission is denied.'
    );

    return false;
  }

  try {
    const permission =
      await Notification.requestPermission();

    return permission === 'granted';
  } catch (error) {
    console.error(
      'Notification permission error:',
      error
    );

    return false;
  }
};

// =====================================================
// SHOW INCOMING CALL NOTIFICATION
// =====================================================

const showIncomingCallNotification = async ({
  callerName = 'Someone',
  callId,
}) => {
  if (!('Notification' in window)) {
    console.warn(
      'Browser notifications are not supported.'
    );

    return null;
  }

  // IMPORTANT:
  // Permission must be granted on the RECEIVER'S browser.
  if (Notification.permission !== 'granted') {
    console.warn(
      'Call notification skipped: notification permission is not granted.'
    );

    return null;
  }

  const title =
    '📞 Incoming Voice Call';

  const body =
    `${callerName} is calling you on ConnectBD`;

  const tag =
    `connectbd-call-${callId || Date.now()}`;

  try {
    // =================================================
    // PREFER SERVICE WORKER
    // =================================================

    if ('serviceWorker' in navigator) {
      try {
        const registration =
          await navigator.serviceWorker.ready;

        if (
          registration &&
          typeof registration.showNotification ===
            'function'
        ) {
          await registration.showNotification(
            title,
            {
              body,

              icon: '/favicon.ico',

              badge: '/favicon.ico',

              tag,

              requireInteraction: true,

              renotify: true,

              data: {
                type:
                  'incoming-voice-call',

                callId,

                url: '/chat',
              },
            }
          );

          console.log(
            'Call notification shown through Service Worker.'
          );

          return true;
        }
      } catch (serviceWorkerError) {
        console.warn(
          'Service Worker notification failed, using fallback:',
          serviceWorkerError
        );
      }
    }

    // =================================================
    // FALLBACK: NORMAL BROWSER NOTIFICATION
    // =================================================

    const notification =
      new Notification(
        title,
        {
          body,

          icon: '/favicon.ico',

          tag,

          requireInteraction: true,
        }
      );

    notification.onclick = () => {
      window.focus();

      notification.close();

      window.location.href =
        '/chat';
    };

    console.log(
      'Call notification shown through browser Notification API.'
    );

    return notification;
  } catch (error) {
    console.error(
      'Call notification error:',
      error
    );

    return null;
  }
};

// =====================================================
// WEBRTC CONFIG
// =====================================================

const ICE_SERVERS = {
  iceServers: [
    {
      urls:
        'stun:stun.l.google.com:19302',
    },
  ],
};

// =====================================================
// VOICE CALL HOOK
// =====================================================

export default function useVoiceCall(
  currentUser
) {
  const [
    callState,
    setCallState,
  ] = useState('idle');

  const [
    incomingCall,
    setIncomingCall,
  ] = useState(null);

  const [
    remoteUser,
    setRemoteUser,
  ] = useState(null);

  const [
    isMuted,
    setIsMuted,
  ] = useState(false);

  const [
    callDuration,
    setCallDuration,
  ] = useState(0);

  const [
    callError,
    setCallError,
  ] = useState('');

  // =====================================================
  // REFS
  // =====================================================

  const peerConnectionRef =
    useRef(null);

  const localStreamRef =
    useRef(null);

  const remoteAudioRef =
    useRef(null);

  const currentCallIdRef =
    useRef(null);

  const currentCallerIdRef =
    useRef(null);

  const currentReceiverIdRef =
    useRef(null);

  const currentConversationIdRef =
    useRef(null);

  const pendingCandidatesRef =
    useRef([]);

  const remoteDescriptionSetRef =
    useRef(false);

  const durationTimerRef =
    useRef(null);

  // =====================================================
  // STOP DURATION TIMER
  // =====================================================

  const stopDurationTimer =
    useCallback(() => {
      if (durationTimerRef.current) {
        clearInterval(
          durationTimerRef.current
        );

        durationTimerRef.current =
          null;
      }
    }, []);

  // =====================================================
  // START DURATION TIMER
  // =====================================================

  const startDurationTimer =
    useCallback(() => {
      stopDurationTimer();

      setCallDuration(0);

      durationTimerRef.current =
        setInterval(() => {
          setCallDuration(
            (previous) =>
              previous + 1
          );
        }, 1000);
    }, [
      stopDurationTimer,
    ]);

  // =====================================================
  // SEND CALL SIGNAL
  // =====================================================

  const sendSignal =
    useCallback(
      async ({
        callerId,
        receiverId,
        conversationId,
        callId,
        type,
        payload = {},
      }) => {
        const { error } =
          await supabase
            .from('call_signals')
            .insert({
              caller_id:
                callerId,

              receiver_id:
                receiverId,

              conversation_id:
                conversationId,

              call_id:
                callId,

              type,

              payload,
            });

        if (error) {
          console.error(
            'Call signal error:',
            error
          );

          throw error;
        }
      },
      []
    );

  // =====================================================
  // CLEANUP CALL
  // =====================================================

  const cleanupCall =
    useCallback(() => {
      stopDurationTimer();

      // -----------------------------------------------
      // Close WebRTC connection
      // -----------------------------------------------

      if (
        peerConnectionRef.current
      ) {
        peerConnectionRef.current
          .onicecandidate = null;

        peerConnectionRef.current
          .ontrack = null;

        peerConnectionRef.current
          .onconnectionstatechange =
          null;

        peerConnectionRef.current.close();

        peerConnectionRef.current =
          null;
      }

      // -----------------------------------------------
      // Stop microphone
      // -----------------------------------------------

      if (
        localStreamRef.current
      ) {
        localStreamRef.current
          .getTracks()
          .forEach((track) => {
            track.stop();
          });

        localStreamRef.current =
          null;
      }

      // -----------------------------------------------
      // Remove remote audio
      // -----------------------------------------------

      if (
        remoteAudioRef.current
      ) {
        remoteAudioRef.current
          .srcObject = null;
      }

      // -----------------------------------------------
      // Reset refs
      // -----------------------------------------------

      pendingCandidatesRef.current =
        [];

      remoteDescriptionSetRef.current =
        false;

      currentCallIdRef.current =
        null;

      currentCallerIdRef.current =
        null;

      currentReceiverIdRef.current =
        null;

      currentConversationIdRef.current =
        null;

      setIsMuted(false);
    }, [
      stopDurationTimer,
    ]);

  // =====================================================
  // CREATE PEER CONNECTION
  // =====================================================

  const createPeerConnection =
    useCallback(
      (
        callId,
        localUserId,
        remoteUserId,
        conversationId
      ) => {
        const peer =
          new RTCPeerConnection(
            ICE_SERVERS
          );

        peerConnectionRef.current =
          peer;

        // -----------------------------------------------
        // ICE CANDIDATE
        // -----------------------------------------------

        peer.onicecandidate =
          async (event) => {
            if (
              !event.candidate
            ) {
              return;
            }

            try {
              await sendSignal({
                callerId:
                  localUserId,

                receiverId:
                  remoteUserId,

                conversationId,

                callId,

                type:
                  'ice-candidate',

                payload: {
                  candidate:
                    event.candidate.toJSON(),
                },
              });
            } catch (error) {
              console.error(
                'ICE candidate error:',
                error
              );
            }
          };

        // -----------------------------------------------
        // REMOTE AUDIO
        // -----------------------------------------------

        peer.ontrack = (
          event
        ) => {
          const [
            remoteStream,
          ] = event.streams;

          if (
            remoteStream &&
            remoteAudioRef.current
          ) {
            remoteAudioRef.current
              .srcObject =
              remoteStream;

            remoteAudioRef.current
              .play()
              .catch(() => {});
          }
        };

        // -----------------------------------------------
        // CONNECTION STATE
        // -----------------------------------------------

        peer.onconnectionstatechange =
          () => {
            const state =
              peer.connectionState;

            console.log(
              'WebRTC connection state:',
              state
            );

            if (
              state === 'connected'
            ) {
              setCallState(
                'active'
              );

              startDurationTimer();
            }

            if (
              state === 'failed' ||
              state === 'disconnected' ||
              state === 'closed'
            ) {
              cleanupCall();

              setCallState(
                'ended'
              );

              setTimeout(() => {
                setCallState(
                  'idle'
                );
              }, 1200);
            }
          };

        return peer;
      },
      [
        cleanupCall,
        sendSignal,
        startDurationTimer,
      ]
    );

  // =====================================================
  // GET MICROPHONE
  // =====================================================

  const getMicrophone =
    useCallback(async () => {
      if (
        !navigator
          .mediaDevices
          ?.getUserMedia
      ) {
        throw new Error(
          'Your browser does not support microphone access.'
        );
      }

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            audio: true,
            video: false,
          }
        );

      localStreamRef.current =
        stream;

      return stream;
    }, []);

  // =====================================================
  // START OUTGOING CALL
  // =====================================================

  const startVoiceCall =
    useCallback(
      async ({
        user,
        conversationId,
      }) => {
        if (
          !currentUser?.id
        ) {
          return;
        }

        if (!user?.id) {
          return;
        }

        if (
          callState !== 'idle'
        ) {
          return;
        }

        try {
          setCallError('');

          // Request permission on the caller's browser.
          // The receiver must separately allow notifications.
          await requestBrowserNotification();

          setRemoteUser(user);

          setCallState(
            'outgoing'
          );

          // -----------------------------------------------
          // Create unique call ID
          // -----------------------------------------------

          const callId =
            crypto.randomUUID();

          currentCallIdRef.current =
            callId;

          currentCallerIdRef.current =
            currentUser.id;

          currentReceiverIdRef.current =
            user.id;

          currentConversationIdRef.current =
            conversationId;

          // -----------------------------------------------
          // Get microphone
          // -----------------------------------------------

          const stream =
            await getMicrophone();

          // -----------------------------------------------
          // Create peer
          // -----------------------------------------------

          const peer =
            createPeerConnection(
              callId,

              currentUser.id,

              user.id,

              conversationId
            );

          // -----------------------------------------------
          // Add microphone
          // -----------------------------------------------

          stream
            .getTracks()
            .forEach((track) => {
              peer.addTrack(
                track,
                stream
              );
            });

          // -----------------------------------------------
          // Create offer
          // -----------------------------------------------

          const offer =
            await peer.createOffer();

          await peer.setLocalDescription(
            offer
          );

          // -----------------------------------------------
          // Send offer to receiver
          // -----------------------------------------------

          await sendSignal({
            callerId:
              currentUser.id,

            receiverId:
              user.id,

            conversationId,

            callId,

            type: 'offer',

            payload: {
              offer,

              caller: {
                id:
                  currentUser.id,

                name:
                  currentUser
                    .user_metadata
                    ?.full_name ||
                  currentUser.email ||
                  'User',
              },
            },
          });

          console.log(
            'Voice call started:',
            callId
          );
        } catch (error) {
          console.error(
            'Start voice call error:',
            error
          );

          cleanupCall();

          setCallState(
            'idle'
          );

          setCallError(
            error.message ||
              'Could not start the call.'
          );
        }
      },
      [
        callState,
        cleanupCall,
        createPeerConnection,
        currentUser,
        getMicrophone,
        sendSignal,
      ]
    );

  // =====================================================
  // ACCEPT INCOMING CALL
  // =====================================================

  const acceptIncomingCall =
    useCallback(
      async () => {
        if (
          !incomingCall ||
          !currentUser?.id
        ) {
          return;
        }

        try {
          setCallError('');

          const {
            callId,
            callerId,
            receiverId,
            conversationId,
            offer,
            caller,
          } = incomingCall;

          setRemoteUser(
            caller
          );

          currentCallIdRef.current =
            callId;

          currentCallerIdRef.current =
            callerId;

          currentReceiverIdRef.current =
            receiverId;

          currentConversationIdRef.current =
            conversationId;

          setCallState(
            'connecting'
          );

          setIncomingCall(
            null
          );

          // -----------------------------------------------
          // Microphone
          // -----------------------------------------------

          const stream =
            await getMicrophone();

          // -----------------------------------------------
          // Create peer
          // -----------------------------------------------

          const peer =
            createPeerConnection(
              callId,

              currentUser.id,

              callerId,

              conversationId
            );

          // -----------------------------------------------
          // Add microphone
          // -----------------------------------------------

          stream
            .getTracks()
            .forEach((track) => {
              peer.addTrack(
                track,
                stream
              );
            });

          // -----------------------------------------------
          // Set remote offer
          // -----------------------------------------------

          await peer.setRemoteDescription(
            new RTCSessionDescription(
              offer
            )
          );

          remoteDescriptionSetRef.current =
            true;

          // -----------------------------------------------
          // Add pending ICE candidates
          // -----------------------------------------------

          for (
            const candidate of
              pendingCandidatesRef.current
          ) {
            try {
              await peer.addIceCandidate(
                candidate
              );
            } catch (error) {
              console.error(
                'Queued ICE error:',
                error
              );
            }
          }

          pendingCandidatesRef.current =
            [];

          // -----------------------------------------------
          // Create answer
          // -----------------------------------------------

          const answer =
            await peer.createAnswer();

          await peer.setLocalDescription(
            answer
          );

          // -----------------------------------------------
          // Send answer to caller
          // -----------------------------------------------

          await sendSignal({
            callerId:
              currentUser.id,

            receiverId:
              callerId,

            conversationId,

            callId,

            type: 'answer',

            payload: {
              answer,
            },
          });

          console.log(
            'Voice call accepted:',
            callId
          );
        } catch (error) {
          console.error(
            'Accept call error:',
            error
          );

          cleanupCall();

          setIncomingCall(
            null
          );

          setCallState(
            'idle'
          );

          setCallError(
            error.message ||
              'Could not accept the call.'
          );
        }
      },
      [
        cleanupCall,
        createPeerConnection,
        currentUser,
        getMicrophone,
        incomingCall,
        sendSignal,
      ]
    );

  // =====================================================
  // REJECT INCOMING CALL
  // =====================================================

  const rejectIncomingCall =
    useCallback(
      async () => {
        if (
          !incomingCall ||
          !currentUser?.id
        ) {
          return;
        }

        const {
          callId,
          callerId,
          receiverId,
          conversationId,
        } = incomingCall;

        try {
          await sendSignal({
            callerId:
              receiverId,

            receiverId:
              callerId,

            conversationId,

            callId,

            type: 'reject',

            payload: {},
          });
        } catch (error) {
          console.error(
            'Reject signal error:',
            error
          );
        }

        setIncomingCall(
          null
        );

        setRemoteUser(
          null
        );

        setCallState(
          'idle'
        );
      },
      [
        currentUser,
        incomingCall,
        sendSignal,
      ]
    );

  // =====================================================
  // TOGGLE MUTE
  // =====================================================

  const toggleMute =
    useCallback(() => {
      const stream =
        localStreamRef.current;

      if (!stream) {
        return;
      }

      const audioTrack =
        stream.getAudioTracks()[0];

      if (!audioTrack) {
        return;
      }

      audioTrack.enabled =
        !audioTrack.enabled;

      setIsMuted(
        !audioTrack.enabled
      );
    }, []);

  // =====================================================
  // END CALL
  // =====================================================

  const endCall =
    useCallback(async () => {
      const callId =
        currentCallIdRef.current;

      const callerId =
        currentCallerIdRef.current;

      const receiverId =
        currentReceiverIdRef.current;

      const conversationId =
        currentConversationIdRef.current;

      if (
        callId &&
        callerId &&
        receiverId
      ) {
        try {
          await sendSignal({
            callerId:
              currentUser?.id ||
              callerId,

            receiverId:
              currentUser?.id ===
              callerId
                ? receiverId
                : callerId,

            conversationId,

            callId,

            type: 'end',

            payload: {},
          });
        } catch (error) {
          console.error(
            'End call signal error:',
            error
          );
        }
      }

      cleanupCall();

      setRemoteUser(
        null
      );

      setIncomingCall(
        null
      );

      setCallState(
        'ended'
      );

      setTimeout(() => {
        setCallState(
          'idle'
        );
      }, 1200);
    }, [
      cleanupCall,
      currentUser,
      sendSignal,
    ]);

  // =====================================================
  // REALTIME CALL SIGNALS
  // =====================================================

  useEffect(() => {
    if (
      !currentUser?.id
    ) {
      return;
    }

    const channel =
      supabase
        .channel(
          `voice-call-${currentUser.id}`
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',

            schema: 'public',

            table: 'call_signals',

            filter:
              `receiver_id=eq.${currentUser.id}`,
          },

          async (payload) => {
            const signal =
              payload.new;

            console.log(
              '📞 Incoming call signal:',
              signal
            );

            const {
              type,

              call_id:
                callId,

              caller_id:
                callerId,

              receiver_id:
                receiverId,

              conversation_id:
                conversationId,

              payload:
                signalPayload,
            } = signal;

            // =================================================
            // OFFER
            // =================================================

            if (
              type === 'offer'
            ) {
              console.log(
                '📞 Incoming voice call offer received'
              );

              // -----------------------------------------------
              // User already busy
              // -----------------------------------------------

              if (
                callState !==
                'idle'
              ) {
                try {
                  await sendSignal({
                    callerId:
                      receiverId,

                    receiverId:
                      callerId,

                    conversationId,

                    callId,

                    type:
                      'busy',

                    payload: {},
                  });
                } catch (error) {
                  console.error(
                    'Busy signal error:',
                    error
                  );
                }

                return;
              }

              // -----------------------------------------------
              // Save current call
              // -----------------------------------------------

              currentCallIdRef.current =
                callId;

              currentCallerIdRef.current =
                callerId;

              currentReceiverIdRef.current =
                receiverId;

              currentConversationIdRef.current =
                conversationId;

              const callerInfo =
                signalPayload
                  ?.caller || {
                  id:
                    callerId,

                  name:
                    'User',
                };

              // -----------------------------------------------
              // Save incoming call
              // -----------------------------------------------

              setIncomingCall({
                callId,

                callerId,

                receiverId,

                conversationId,

                offer:
                  signalPayload
                    ?.offer,

                caller:
                  callerInfo,
              });

              // -----------------------------------------------
              // CALL BROWSER NOTIFICATION
              // -----------------------------------------------

              void showIncomingCallNotification({
                callerName:
                  callerInfo.name ||
                  'Someone',

                callId,
              });

              // -----------------------------------------------
              // In-app call popup
              // -----------------------------------------------

              setCallState(
                'incoming'
              );

              return;
            }

            // =================================================
            // ANSWER
            // =================================================

            if (
              type === 'answer'
            ) {
              if (
                callId !==
                currentCallIdRef.current
              ) {
                return;
              }

              const peer =
                peerConnectionRef.current;

              if (!peer) {
                return;
              }

              try {
                await peer.setRemoteDescription(
                  new RTCSessionDescription(
                    signalPayload.answer
                  )
                );

                remoteDescriptionSetRef.current =
                  true;

                // Add queued ICE
                for (
                  const candidate of
                    pendingCandidatesRef.current
                ) {
                  try {
                    await peer.addIceCandidate(
                      candidate
                    );
                  } catch (error) {
                    console.error(
                      'Pending ICE error:',
                      error
                    );
                  }
                }

                pendingCandidatesRef.current =
                  [];

                setCallState(
                  'connecting'
                );
              } catch (error) {
                console.error(
                  'Answer handling error:',
                  error
                );
              }

              return;
            }

            // =================================================
            // ICE CANDIDATE
            // =================================================

            if (
              type ===
              'ice-candidate'
            ) {
              if (
                callId !==
                currentCallIdRef.current
              ) {
                return;
              }

              const candidateData =
                signalPayload
                  ?.candidate;

              if (
                !candidateData
              ) {
                return;
              }

              const candidate =
                new RTCIceCandidate(
                  candidateData
                );

              const peer =
                peerConnectionRef.current;

              if (
                peer &&
                remoteDescriptionSetRef.current
              ) {
                try {
                  await peer.addIceCandidate(
                    candidate
                  );
                } catch (error) {
                  console.error(
                    'ICE candidate add error:',
                    error
                  );
                }
              } else {
                pendingCandidatesRef.current.push(
                  candidate
                );
              }

              return;
            }

            // =================================================
            // REJECT
            // =================================================

            if (
              type ===
              'reject'
            ) {
              if (
                callId !==
                currentCallIdRef.current
              ) {
                return;
              }

              cleanupCall();

              setRemoteUser(
                null
              );

              setIncomingCall(
                null
              );

              setCallState(
                'ended'
              );

              setTimeout(() => {
                setCallState(
                  'idle'
                );
              }, 1200);

              return;
            }

            // =================================================
            // BUSY
            // =================================================

            if (
              type ===
              'busy'
            ) {
              if (
                callId !==
                currentCallIdRef.current
              ) {
                return;
              }

              cleanupCall();

              setRemoteUser(
                null
              );

              setCallState(
                'ended'
              );

              setCallError(
                'User is currently busy.'
              );

              setTimeout(() => {
                setCallState(
                  'idle'
                );
              }, 1500);

              return;
            }

            // =================================================
            // END
            // =================================================

            if (
              type === 'end'
            ) {
              if (
                callId !==
                currentCallIdRef.current
              ) {
                return;
              }

              cleanupCall();

              setRemoteUser(
                null
              );

              setIncomingCall(
                null
              );

              setCallState(
                'ended'
              );

              setTimeout(() => {
                setCallState(
                  'idle'
                );
              }, 1200);
            }
          }
        )
        .subscribe(
          (status) => {
            console.log(
              '📡 Voice call realtime:',
              status
            );
          }
        );

    return () => {
      supabase.removeChannel(
        channel
      );
    };
  }, [
    callState,
    cleanupCall,
    currentUser?.id,
    sendSignal,
  ]);

  // =====================================================
  // CLEANUP ON UNMOUNT
  // =====================================================

  useEffect(() => {
    return () => {
      cleanupCall();
    };
  }, [
    cleanupCall,
  ]);

  // =====================================================
  // RETURN
  // =====================================================

  return {
    callState,

    incomingCall,

    remoteUser,

    isMuted,

    callDuration,

    callError,

    remoteAudioRef,

    startVoiceCall,

    acceptIncomingCall,

    rejectIncomingCall,

    toggleMute,

    endCall,

    setCallError,
  };
}