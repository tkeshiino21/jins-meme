/*      JINS MEME Controller Library           */
/*      Copyright 2019, 2018 JINS Inc.         */

const jmctrllib = (function() {
    //Buffers
    let gb = {
        rt_cnt_sw :0,  //cumulative counter
        rt_cnt_em :0,  //cumulative counter
        wa_accy : 0.0, wa_accz : -16.0, tilt : 0, //initial 1g
        yaw_m0 : [0, 0], yaw_m1 : [0, 0], //yaw and diff yaw,m1 means former value
        pitch_m0 : [0, 0], pitch_m1 : [0, 0], //pitch and diff pitch,,m1 means former value
        yaw_swing_cnt :0, yaw_swing_fep_sign : 0, yaw_swing_fep_cnt : -100,
        yaw_swing_seq_cnt : 1, yaw_swing_in_seq : 0, yaw_swing_start_sign : 0,
        pitch_swing_cnt :0, pitch_swing_fep_sign : 0, pitch_swing_fep_cnt : -100,
        pitch_swing_seq_cnt : 1, pitch_swing_in_seq : 0, pitch_swing_start_sign : 0,
        em_long_cnt :0, em_long_fep_cnt : -100, em_long_fep_sign : 0,
        em_long_seq_cnt : 1,  em_long_in_seq : 0, em_long_start_sign : 0,
        em_lat_cnt :0, em_lat_fep_cnt : -100, em_lat_fep_sign : 0,
        em_lat_seq_cnt : 1,  em_lat_in_seq : 0, em_lat_start_sign : 0,
        yawm1 : 0, rotation : 0,//only for getSequentialYaw
    }
    //Parameters
    const param = {
        yaw_d1_th:3.1,pitch_d1_th:1.5,
        yaw_seq_th:8, pitch_seq_th:8, em_long_seq_th:10, em_lat_seq_th:10,
    }
    
    //Public methods
    return {
        //initialization
        init: function(yaw_seq_th = 8, pitch_seq_th = 8, em_long_seq_th = 10, em_lat_seq_th = 10) {
          param.yaw_seq_th = yaw_seq_th;
          param.pitch_seq_th = pitch_seq_th;
          param.em_long_seq_th = em_long_seq_th;
          param.em_lat_seq_th = em_lat_seq_th;
        },
        getSequentialYaw: function(data) {
            const yaw_temp = data.yaw + 360 * gb.rotation;
            gb.rotation += Math.abs(data.yaw - gb.yawm1) > 300 ? -1 * Math.sign(data.yaw - gb.yawm1) : 0;
            gb.yawm1 = data.yaw;
            return data.yaw + 360 * gb.rotation;
        },  
        getSequentialSwing: function(data) {
            gb.rt_cnt_sw += 1;
            gb.yaw_m0[0] = data.yaw;
            if(Math.abs(gb.yaw_m1[0] - gb.yaw_m0[0]) > 300){  //in case one turn
                gb.yaw_m0[1] = gb.yaw_m1[0] - (gb.yaw_m0[0] + 360 * Math.sign(gb.yaw_m1[0] - gb.yaw_m0[0]));
            } else {
                gb.yaw_m0[1] = gb.yaw_m1[0] - gb.yaw_m0[0];
            }
            //in case a peak finished
            if((Math.abs(gb.yaw_m1[1]) >= param.yaw_d1_th && Math.abs(gb.yaw_m0[1]) >= param.yaw_d1_th && Math.sign(gb.yaw_m1[1] * gb.yaw_m0[1]) == -1 ) ||
               (Math.abs(gb.yaw_m1[1]) >= param.yaw_d1_th && Math.abs(gb.yaw_m0[1]) < param.yaw_d1_th && gb.rt_cnt_sw > 10) ){
                gb.yaw_swing_cnt += 1;
                gb.yaw_swing_in_seq = 1; //in seqence flag
                gb.yaw_swing_fep_sign = Math.sign(gb.yaw_m0[1]); //set sign
                if(gb.rt_cnt_sw - gb.yaw_swing_fep_cnt <= param.yaw_seq_th){
                    gb.yaw_swing_seq_cnt += 1;
                }
                gb.yaw_swing_fep_cnt = gb.rt_cnt_sw; //set former peak count
            }
            //finish seqencial peak detection
            if(gb.yaw_swing_in_seq == 1 && (gb.rt_cnt_sw - gb.yaw_swing_fep_cnt > param.yaw_seq_th)){
                const direction = -1 * gb.yaw_swing_fep_sign * ((gb.yaw_swing_seq_cnt % 2) * 2 - 1);
                const event_sw_lat = new CustomEvent('jmctrllib_swing_lat',
                    { detail: { direction: direction, count: gb.yaw_swing_seq_cnt }});
                document.dispatchEvent(event_sw_lat);
                gb.yaw_swing_in_seq = 0;
                gb.yaw_swing_seq_cnt = 1;
            }
            gb.yaw_m1 = [].concat(gb.yaw_m0); //copy array
    
            gb.pitch_m0[0] = data.pitch;
            if(Math.abs(gb.pitch_m1[0] - gb.pitch_m0[0]) > 300){ //in case one turn
                gb.pitch_m0[1] = gb.pitch_m1[0] - (gb.pitch_m0[0] + 360 * Math.sign(gb.pitch_m1[0] - gb.pitch_m0[0]));
            } else {
                gb.pitch_m0[1] = gb.pitch_m1[0] - gb.pitch_m0[0];
            }
            
            //in case a peak finished
            if((Math.abs(gb.pitch_m1[1]) >= param.pitch_d1_th && Math.abs(gb.pitch_m0[1]) >= param.pitch_d1_th && Math.sign(gb.pitch_m1[1] * gb.pitch_m0[1]) == -1 ) ||
               (Math.abs(gb.pitch_m1[1]) >= param.pitch_d1_th && Math.abs(gb.pitch_m0[1]) < param.pitch_d1_th && gb.rt_cnt_sw > 10)){
                gb.pitch_swing_cnt += 1;
                gb.pitch_swing_in_seq = 1; //in seqence flag
                gb.pitch_swing_fep_sign = Math.sign(gb.pitch_m0[1]); //set sign
                if(gb.rt_cnt_sw - gb.pitch_swing_fep_cnt <= param.pitch_seq_th){
                    gb.pitch_swing_seq_cnt += 1;
                }
                gb.pitch_swing_fep_cnt = gb.rt_cnt_sw; //set former peak count
            }
            //finish seqencial peak detection
            if(gb.pitch_swing_in_seq == 1 && (gb.rt_cnt_sw - gb.pitch_swing_fep_cnt > param.pitch_seq_th)){
                const direction = gb.pitch_swing_fep_sign * ((gb.pitch_swing_seq_cnt % 2) * 2 - 1);
                const event_sw_long = new CustomEvent('jmctrllib_swing_long',
                    { detail: { direction: direction, count: gb.pitch_swing_seq_cnt }});
                document.dispatchEvent(event_sw_long);
                gb.pitch_swing_in_seq = 0;
                gb.pitch_swing_seq_cnt = 1;
            }
            gb.pitch_m1 = [].concat(gb.pitch_m0); //copy array
        },
        
        getSequentialEyeMove: function(data) {
            gb.rt_cnt_em += 1;
            var em_min_th = 1;
            //lalteral
            if(data.eyeMoveRight > em_min_th || data.eyeMoveLeft > em_min_th){
                gb.em_lat_cnt += 1;
                gb.em_lat_in_seq = 1; //in seqence flag
                gb.em_lat_fep_sign = data.eyeMoveRight > em_min_th ? 1 : -1; //set sign
                if(gb.rt_cnt_em - gb.em_lat_fep_cnt <= param.em_lat_seq_th){
                    gb.em_lat_seq_cnt += 1;
                }
                gb.em_lat_fep_cnt = gb.rt_cnt_em; //set former peak count
            }
            //finish seqencial peak detection
            if(gb.em_lat_in_seq == 1 && (gb.rt_cnt_em - gb.em_lat_fep_cnt > param.em_lat_seq_th)){
                const direction = gb.em_lat_fep_sign * ((gb.em_lat_seq_cnt % 2) * 2 - 1);
                const event_em_lat = new CustomEvent('jmctrllib_eyemove_lat',
                    { detail: { direction: direction, count: gb.em_lat_seq_cnt }});
                document.dispatchEvent(event_em_lat);
                gb.em_lat_in_seq = 0;
                gb.em_lat_seq_cnt = 1;
            }

            //longitudinal
            if(data.eyeMoveUp > em_min_th || data.eyeMoveDown > em_min_th){
                gb.em_long_cnt += 1;
                gb.em_long_in_seq = 1; //in seqence flag
                gb.em_long_fep_sign = data.eyeMoveRight > em_min_th ? 1 : -1; //set sign
                if(gb.rt_cnt_em - gb.em_long_fep_cnt <= param.em_long_seq_th){
                    gb.em_long_seq_cnt += 1;
                }
                gb.em_long_fep_cnt = gb.rt_cnt_em; //set former peak count
            }
            //finish seqencial peak detection
            if(gb.em_long_in_seq == 1 && (gb.rt_cnt_em - gb.em_long_fep_cnt > param.em_long_seq_th)){
                const direction = gb.em_long_fep_sign * ((gb.em_long_seq_cnt % 2) * 2 - 1);
                const event_em_long = new CustomEvent('jmctrllib_eyemove_long',
                    { detail: { direction: direction, count: gb.em_long_seq_cnt }});
                document.dispatchEvent(event_em_long);
                gb.em_long_in_seq = 0;
                gb.em_long_seq_cnt = 1;
            }
        },
        
        //calc pitch tilt
        calcTilt: function(data) {
            gb.wa_accy = gb.wa_accy * 0.9 + data.accY * 0.1; //wa Y
            gb.wa_accz = gb.wa_accz * 0.9 + data.accZ * 0.1; //wa Z
            const tilt = Math.atan2(gb.wa_accy,-1 * gb.wa_accz) * 57.3;
            return tilt;
        }
    };

})();
